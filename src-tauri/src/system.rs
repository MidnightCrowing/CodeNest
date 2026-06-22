mod accent;
mod external;
mod path;
mod terminal;
mod window;

use serde::Serialize;

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
pub fn open_external(url: String) -> bool {
    external::open_external(url)
}

#[tauri::command]
pub fn open_in_explorer(path: String) -> bool {
    external::open_in_explorer(path)
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
