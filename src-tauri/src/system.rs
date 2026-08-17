mod accent;
mod path;
mod terminal;
mod window;

use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

#[derive(Serialize)]
pub struct PathExistenceResult {
    exists: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[tauri::command]
pub fn format_path(file_path: String) -> String {
    path::format_path(file_path)
}

#[tauri::command]
pub fn check_path_existence(path: String) -> PathExistenceResult {
    path::check_path_existence(path)
}

#[tauri::command]
pub fn open_external(app: AppHandle, url: String) -> bool {
    app.opener().open_url(url, None::<&str>).is_ok()
}

#[tauri::command]
pub fn open_in_explorer(app: AppHandle, path: String) -> bool {
    app.opener().reveal_item_in_dir(path).is_ok()
}

#[tauri::command]
pub fn open_in_terminal(path: String, terminal_command: Option<String>) -> Result<String, String> {
    terminal::open_in_terminal(path, terminal_command)
}

#[tauri::command]
pub fn set_window_theme(current_theme: String) {
    accent::set_window_theme(current_theme)
}

#[tauri::command]
pub fn get_system_accent_color(current_theme: Option<String>) -> Option<String> {
    accent::get_system_accent_color(current_theme)
}

#[tauri::command]
pub fn minimize_window(window: tauri::WebviewWindow) -> bool {
    window::minimize_window(window)
}

#[tauri::command]
pub fn toggle_maximize_window(window: tauri::WebviewWindow) -> bool {
    window::toggle_maximize_window(window)
}

#[tauri::command]
pub fn close_window(window: tauri::WebviewWindow) -> bool {
    window::close_window(window)
}
