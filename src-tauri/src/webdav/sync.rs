use reqwest::{Client, StatusCode};
use tauri::AppHandle;

use crate::data::{data_file_path, write_data_file_safely};

use super::{
    error::request_error,
    files::{
        backup_local_sync_files, prepare_pull_content, prepare_upload_content, read_or_default,
        SYNC_FILES,
    },
    models::WebDavConfig,
    remote::{create_remote_dir, remote_file_url, validate_config, with_auth},
};

pub(super) async fn upload_data(app: AppHandle, config: WebDavConfig) -> Result<usize, String> {
    validate_config(&config)?;

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|error| error.to_string())?;
    create_remote_dir(&client, &config).await?;

    let mut count = 0;
    for file in SYNC_FILES {
        let path = data_file_path(&app, file.kind)?;
        let raw = read_or_default(path, file.fallback)?;
        let content = prepare_upload_content(file.kind, &raw)?;
        let url = remote_file_url(&config, file.name)?;
        let request = with_auth(client.put(url).body(content), &config)
            .header("Content-Type", "application/json");
        let response = request.send().await.map_err(request_error)?;
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

pub(super) async fn pull_data(app: AppHandle, config: WebDavConfig) -> Result<usize, String> {
    validate_config(&config)?;

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|error| error.to_string())?;
    let mut pulled_files = Vec::new();
    for file in SYNC_FILES {
        let url = remote_file_url(&config, file.name)?;
        let response = with_auth(client.get(url), &config)
            .send()
            .await
            .map_err(request_error)?;
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

        let raw = response.text().await.map_err(request_error)?;
        let content = prepare_pull_content(&app, file.kind, &raw)?;
        pulled_files.push((file.kind, content));
    }

    backup_local_sync_files(&app)?;

    let count = pulled_files.len();
    for (kind, content) in pulled_files {
        write_data_file_safely(&data_file_path(&app, kind)?, &content)?;
    }

    Ok(count)
}
