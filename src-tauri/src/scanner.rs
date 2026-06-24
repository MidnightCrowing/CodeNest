mod detect;
mod git;
mod models;
mod scan;

use models::{ScanPayload, ScanResult};

#[tauri::command]
pub async fn scan_projects(payload: ScanPayload) -> Result<ScanResult, String> {
    tauri::async_runtime::spawn_blocking(move || scan::scan_projects(payload))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn detect_jetbrains_config_root_path(app: tauri::AppHandle) -> Option<String> {
    detect::detect_jetbrains_config_root_path(app)
}

#[tauri::command]
pub fn detect_recent_editor_state_db_path(editor: String) -> Option<String> {
    detect::detect_recent_editor_state_db_path(&editor)
}

#[tauri::command]
pub fn detect_cli_history_root_path(editor: String) -> Option<String> {
    detect::detect_cli_history_root_path(&editor)
}
