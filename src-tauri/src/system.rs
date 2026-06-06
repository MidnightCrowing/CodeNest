use std::{fs, path::PathBuf, process::Command};

use serde::Serialize;

#[derive(Serialize)]
pub struct PathExistenceResult {
    exists: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[tauri::command]
pub fn format_path(file_path: String) -> String {
    let Some(home) = dirs::home_dir() else {
        return file_path;
    };
    let home = home.to_string_lossy().into_owned();
    if file_path.starts_with(&home) {
        file_path.replacen(&home, "~", 1)
    } else {
        file_path
    }
}

#[tauri::command]
pub fn check_path_existence(path: String) -> PathExistenceResult {
    match fs::metadata(path) {
        Ok(_) => PathExistenceResult {
            exists: true,
            error: None,
        },
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => PathExistenceResult {
            exists: false,
            error: None,
        },
        Err(error) => PathExistenceResult {
            exists: false,
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn open_external(url: String) -> bool {
    open::that(url).is_ok()
}

#[tauri::command]
pub fn open_in_explorer(path: String) -> bool {
    open::that(PathBuf::from(path)).is_ok()
}

#[tauri::command]
pub fn open_in_terminal(path: String) -> bool {
    let path = PathBuf::from(path);
    if !path.is_dir() {
        return false;
    }

    if cfg!(windows) {
        Command::new("cmd.exe")
            .arg("/K")
            .current_dir(&path)
            .spawn()
            .is_ok()
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .args(["-a", "Terminal", &path.to_string_lossy()])
            .spawn()
            .is_ok()
    } else {
        ["gnome-terminal", "konsole", "x-terminal-emulator"]
            .iter()
            .any(|terminal| Command::new(terminal).current_dir(&path).spawn().is_ok())
    }
}

#[tauri::command]
pub fn set_window_theme(_current_theme: String) {}

#[tauri::command]
pub fn minimize_window(window: tauri::WebviewWindow) -> bool {
    window.minimize().is_ok()
}

#[tauri::command]
pub fn toggle_maximize_window(window: tauri::WebviewWindow) -> bool {
    match window.is_maximized() {
        Ok(true) => window.unmaximize().is_ok(),
        Ok(false) => window.maximize().is_ok(),
        Err(_) => false,
    }
}

#[tauri::command]
pub fn close_window(window: tauri::WebviewWindow) -> bool {
    window.close().is_ok()
}
