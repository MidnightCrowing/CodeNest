use std::{
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use reqwest::{Client, Method, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager};
use url::Url;

use crate::data::{data_file_path, DataFileKind};

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebDavConfig {
    endpoint: String,
    username: Option<String>,
    password: Option<String>,
    remote_path: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WebDavSyncResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

struct SyncFile {
    kind: DataFileKind,
    name: &'static str,
    fallback: &'static str,
}

const SYNC_FILES: [SyncFile; 2] = [
    SyncFile {
        kind: DataFileKind::Settings,
        name: "settings.json",
        fallback: "{}",
    },
    SyncFile {
        kind: DataFileKind::Projects,
        name: "projects.json",
        fallback: "[]",
    },
];

#[tauri::command]
pub async fn webdav_upload_data(app: AppHandle, config: WebDavConfig) -> WebDavSyncResult {
    match upload_data(app, config).await {
        Ok(count) => sync_success(format!("Uploaded {count} files")),
        Err(error) => sync_error(error),
    }
}

#[tauri::command]
pub async fn webdav_pull_data(app: AppHandle, config: WebDavConfig) -> WebDavSyncResult {
    match pull_data(app, config).await {
        Ok(count) => sync_success(format!("Pulled {count} files")),
        Err(error) => sync_error(error),
    }
}

#[tauri::command]
pub async fn webdav_test_connection(config: WebDavConfig) -> WebDavSyncResult {
    match test_connection(config).await {
        Ok(()) => sync_success("WebDAV connection OK".to_string()),
        Err(error) => sync_error(error),
    }
}

async fn test_connection(config: WebDavConfig) -> Result<(), String> {
    validate_config(&config)?;

    let client = Client::new();
    let response = with_auth(
        client.request(Method::OPTIONS, remote_url(&config, None, None)?),
        &config,
    )
    .send()
    .await
    .map_err(|error| error.to_string())?;

    if response.status().is_success() {
        return Ok(());
    }

    Err(format!("WebDAV connection failed: {}", response.status()))
}

async fn upload_data(app: AppHandle, config: WebDavConfig) -> Result<usize, String> {
    validate_config(&config)?;

    let client = Client::new();
    create_remote_dir(&client, &config).await?;

    let mut count = 0;
    for file in SYNC_FILES {
        let path = data_file_path(&app, file.kind)?;
        let raw = read_or_default(path, file.fallback)?;
        let content = prepare_upload_content(file.kind, &raw)?;
        let url = remote_file_url(&config, file.name)?;
        let request = with_auth(client.put(url).body(content), &config)
            .header("Content-Type", "application/json");
        let response = request.send().await.map_err(|error| error.to_string())?;
        if !response.status().is_success() {
            return Err(format!(
                "Failed to upload {}: {}",
                file.name,
                response.status()
            ));
        }
        count += 1;
    }

    Ok(count)
}

async fn pull_data(app: AppHandle, config: WebDavConfig) -> Result<usize, String> {
    validate_config(&config)?;

    let client = Client::new();
    let mut pulled_files = Vec::new();
    for file in SYNC_FILES {
        let url = remote_file_url(&config, file.name)?;
        let response = with_auth(client.get(url), &config)
            .send()
            .await
            .map_err(|error| error.to_string())?;
        if response.status() == StatusCode::NOT_FOUND {
            return Err(format!("Remote file not found: {}", file.name));
        }
        if !response.status().is_success() {
            return Err(format!(
                "Failed to pull {}: {}",
                file.name,
                response.status()
            ));
        }

        let raw = response.text().await.map_err(|error| error.to_string())?;
        let content = prepare_pull_content(&app, file.kind, &raw)?;
        pulled_files.push((file.kind, content));
    }

    backup_local_sync_files(&app)?;

    let count = pulled_files.len();
    for (kind, content) in pulled_files {
        write_local_file(data_file_path(&app, kind)?, content)?;
    }

    Ok(count)
}

fn backup_local_sync_files(app: &AppHandle) -> Result<PathBuf, String> {
    let backup_root = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("backups")
        .join(format!(
            "webdav-pull-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map_err(|error| error.to_string())?
                .as_secs()
        ));
    fs::create_dir_all(&backup_root).map_err(|error| error.to_string())?;

    for file in SYNC_FILES {
        let source = data_file_path(app, file.kind)?;
        if source.exists() {
            fs::copy(source, backup_root.join(file.name)).map_err(|error| error.to_string())?;
        }
    }

    Ok(backup_root)
}

async fn create_remote_dir(client: &Client, config: &WebDavConfig) -> Result<(), String> {
    let remote_path = normalized_remote_path(config);
    if remote_path.is_empty() {
        return Ok(());
    }

    let mut current = String::new();
    for part in remote_path.split('/').filter(|part| !part.is_empty()) {
        if !current.is_empty() {
            current.push('/');
        }
        current.push_str(part);
        if remote_dir_exists(client, config, &current).await? {
            continue;
        }

        let url = remote_collection_url(config, &current)?;
        let response = with_auth(
            client.request(
                Method::from_bytes(b"MKCOL").map_err(|error| error.to_string())?,
                url,
            ),
            config,
        )
        .send()
        .await
        .map_err(|error| error.to_string())?;
        let status = response.status();
        if status.is_success() {
            continue;
        }
        if matches!(
            status,
            StatusCode::METHOD_NOT_ALLOWED | StatusCode::CONFLICT
        ) && remote_dir_exists(client, config, &current).await?
        {
            continue;
        }
        return Err(format!("Failed to create remote directory: {}", status));
    }

    Ok(())
}

async fn remote_dir_exists(
    client: &Client,
    config: &WebDavConfig,
    remote_path: &str,
) -> Result<bool, String> {
    let response = with_auth(
        client
            .request(
                Method::from_bytes(b"PROPFIND").map_err(|error| error.to_string())?,
                remote_collection_url(config, remote_path)?,
            )
            .header("Depth", "0"),
        config,
    )
    .send()
    .await
    .map_err(|error| error.to_string())?;

    let status = response.status();
    if status.is_success() || status.as_u16() == 207 {
        return Ok(true);
    }
    if matches!(status, StatusCode::NOT_FOUND | StatusCode::CONFLICT) {
        return Ok(false);
    }

    Err(format!("Failed to check remote directory: {}", status))
}

fn prepare_upload_content(kind: DataFileKind, raw: &str) -> Result<String, String> {
    let mut value = parse_json(raw)?;
    if matches!(kind, DataFileKind::Settings) {
        if let Some(object) = value.as_object_mut() {
            object.remove("webdav");
        }
    }
    to_pretty_json(&value)
}

fn prepare_pull_content(app: &AppHandle, kind: DataFileKind, raw: &str) -> Result<String, String> {
    let mut value = parse_json(raw)?;
    if matches!(kind, DataFileKind::Settings) {
        let local = read_or_default(data_file_path(app, DataFileKind::Settings)?, "{}")?;
        if let Some(webdav) = parse_json(&local)?.get("webdav").cloned() {
            if let Some(object) = value.as_object_mut() {
                object.insert("webdav".to_string(), webdav);
            }
        }
    }
    to_pretty_json(&value)
}

fn read_or_default(path: PathBuf, fallback: &str) -> Result<String, String> {
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(fallback.to_string()),
        Err(error) => Err(error.to_string()),
    }
}

fn write_local_file(path: PathBuf, content: String) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(path, content).map_err(|error| error.to_string())
}

fn validate_config(config: &WebDavConfig) -> Result<(), String> {
    if config.endpoint.trim().is_empty() {
        return Err("WebDAV URL is required".to_string());
    }
    remote_file_url(config, "settings.json").map(|_| ())
}

fn remote_file_url(config: &WebDavConfig, file_name: &str) -> Result<Url, String> {
    remote_url(
        config,
        Some(&normalized_remote_path(config)),
        Some(file_name),
    )
}

fn remote_url(
    config: &WebDavConfig,
    remote_path: Option<&str>,
    file_name: Option<&str>,
) -> Result<Url, String> {
    let endpoint = ensure_trailing_slash(config.endpoint.trim());
    let mut url = Url::parse(&endpoint).map_err(|error| error.to_string())?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "Invalid WebDAV URL".to_string())?;
        if let Some(remote_path) = remote_path {
            for segment in remote_path.split('/').filter(|segment| !segment.is_empty()) {
                segments.push(segment);
            }
        }
        if let Some(file_name) = file_name {
            segments.push(file_name);
        }
    }
    Ok(url)
}

fn remote_collection_url(config: &WebDavConfig, remote_path: &str) -> Result<Url, String> {
    let endpoint = ensure_trailing_slash(config.endpoint.trim());
    let mut url = Url::parse(&endpoint).map_err(|error| error.to_string())?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "Invalid WebDAV URL".to_string())?;
        for segment in remote_path.split('/').filter(|segment| !segment.is_empty()) {
            segments.push(segment);
        }
        segments.push("");
    }
    Ok(url)
}

fn normalized_remote_path(config: &WebDavConfig) -> String {
    config
        .remote_path
        .as_deref()
        .unwrap_or("CodeNest")
        .trim()
        .trim_matches('/')
        .to_string()
}

fn ensure_trailing_slash(value: &str) -> String {
    if value.ends_with('/') {
        value.to_string()
    } else {
        format!("{value}/")
    }
}

fn with_auth(request: reqwest::RequestBuilder, config: &WebDavConfig) -> reqwest::RequestBuilder {
    let username = config.username.as_deref().unwrap_or("").trim();
    if username.is_empty() {
        return request;
    }
    request.basic_auth(username, config.password.clone())
}

fn parse_json(raw: &str) -> Result<Value, String> {
    serde_json::from_str::<Value>(raw).map_err(|error| error.to_string())
}

fn to_pretty_json(value: &Value) -> Result<String, String> {
    serde_json::to_string_pretty(value).map_err(|error| error.to_string())
}

fn sync_success(message: String) -> WebDavSyncResult {
    WebDavSyncResult {
        success: true,
        message: Some(message),
        error: None,
    }
}

fn sync_error(error: String) -> WebDavSyncResult {
    WebDavSyncResult {
        success: false,
        message: None,
        error: Some(error),
    }
}
