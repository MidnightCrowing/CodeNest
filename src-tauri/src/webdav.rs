mod error;
mod files;
mod models;
mod remote;
mod sync;

use tauri::AppHandle;

use models::{sync_error, sync_success, WebDavConfig, WebDavSyncResult};

#[tauri::command]
pub async fn webdav_upload_data(app: AppHandle, config: WebDavConfig) -> WebDavSyncResult {
    match sync::upload_data(app, config).await {
        Ok(count) => sync_success(format!("Uploaded {count} files")),
        Err(error) => sync_error(error),
    }
}

#[tauri::command]
pub async fn webdav_pull_data(app: AppHandle, config: WebDavConfig) -> WebDavSyncResult {
    match sync::pull_data(app, config).await {
        Ok(count) => sync_success(format!("Pulled {count} files")),
        Err(error) => sync_error(error),
    }
}

#[tauri::command]
pub async fn webdav_test_connection(config: WebDavConfig) -> WebDavSyncResult {
    match remote::test_connection(config).await {
        Ok(()) => sync_success("WebDAV connection OK".to_string()),
        Err(error) => sync_error(error),
    }
}
