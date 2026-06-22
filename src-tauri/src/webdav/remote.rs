use reqwest::{Client, Method, StatusCode};
use url::Url;

use super::{error::request_error, models::WebDavConfig};

pub(super) async fn test_connection(config: WebDavConfig) -> Result<(), String> {
    validate_config(&config)?;

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|error| error.to_string())?;
    let response = with_auth(
        client.request(Method::OPTIONS, remote_url(&config, None, None)?),
        &config,
    )
    .send()
    .await
    .map_err(request_error)?;

    if response.status().is_success() {
        return Ok(());
    }

    Err(format!("WebDAV connection failed: {}", response.status()))
}

pub(super) async fn create_remote_dir(
    client: &Client,
    config: &WebDavConfig,
) -> Result<(), String> {
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
        .map_err(request_error)?;
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
    .map_err(request_error)?;

    let status = response.status();
    if status.is_success() || status.as_u16() == 207 {
        return Ok(true);
    }
    if matches!(status, StatusCode::NOT_FOUND | StatusCode::CONFLICT) {
        return Ok(false);
    }

    Err(format!("Failed to check remote directory: {}", status))
}

pub(super) fn validate_config(config: &WebDavConfig) -> Result<(), String> {
    if config.endpoint.trim().is_empty() {
        return Err("WebDAV URL is required".to_string());
    }
    remote_file_url(config, "settings.json").map(|_| ())
}

pub(super) fn remote_file_url(config: &WebDavConfig, file_name: &str) -> Result<Url, String> {
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

pub(super) fn with_auth(
    request: reqwest::RequestBuilder,
    config: &WebDavConfig,
) -> reqwest::RequestBuilder {
    let username = config.username.as_deref().unwrap_or("").trim();
    if username.is_empty() {
        return request;
    }
    request.basic_auth(username, config.password.clone())
}
