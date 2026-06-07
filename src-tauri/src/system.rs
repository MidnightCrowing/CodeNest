use std::{fs, path::PathBuf, process::Command};

use serde::Serialize;

#[cfg(target_os = "windows")]
use winreg::{enums::HKEY_CURRENT_USER, RegKey};

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

#[cfg(target_os = "windows")]
#[link(name = "dwmapi")]
extern "system" {
    fn DwmGetColorizationColor(colorization: *mut u32, opaque_blend: *mut i32) -> i32;
}

#[cfg(target_os = "windows")]
const WINDOWS_ACCENT_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Accent";

#[cfg(target_os = "windows")]
fn rgb_to_hex(red: u32, green: u32, blue: u32) -> String {
    format!("#{red:02x}{green:02x}{blue:02x}")
}

#[cfg(target_os = "windows")]
fn abgr_to_hex(color: u32) -> String {
    let red = color & 0xff;
    let green = (color >> 8) & 0xff;
    let blue = (color >> 16) & 0xff;
    rgb_to_hex(red, green, blue)
}

#[cfg(target_os = "windows")]
fn argb_to_hex(color: u32) -> String {
    let red = (color >> 16) & 0xff;
    let green = (color >> 8) & 0xff;
    let blue = color & 0xff;
    rgb_to_hex(red, green, blue)
}

#[cfg(target_os = "windows")]
fn read_windows_accent_palette_color(current_theme: Option<&str>) -> Option<String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let accent_key = hkcu.open_subkey(WINDOWS_ACCENT_KEY).ok()?;
    let palette = accent_key.get_raw_value("AccentPalette").ok()?.bytes;
    let palette_index = if current_theme == Some("dark") { 2 } else { 4 };
    let offset = palette_index * 4;

    if palette.len() < offset + 3 {
        return None;
    }

    Some(rgb_to_hex(
        palette[offset].into(),
        palette[offset + 1].into(),
        palette[offset + 2].into(),
    ))
}

#[cfg(target_os = "windows")]
fn read_windows_accent_color_menu() -> Option<String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let accent_key = hkcu.open_subkey(WINDOWS_ACCENT_KEY).ok()?;
    let color = accent_key.get_value::<u32, _>("AccentColorMenu").ok()?;
    Some(abgr_to_hex(color))
}

#[cfg(target_os = "windows")]
fn read_windows_dwm_accent_color() -> Option<String> {
    unsafe {
        let mut color = 0_u32;
        let mut opaque_blend = 0_i32;
        if DwmGetColorizationColor(&mut color, &mut opaque_blend) == 0 {
            return Some(argb_to_hex(color));
        }
    }

    None
}

#[tauri::command]
pub fn get_system_accent_color(current_theme: Option<String>) -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        let current_theme = current_theme.as_deref();
        return read_windows_accent_palette_color(current_theme)
            .or_else(read_windows_accent_color_menu)
            .or_else(read_windows_dwm_accent_color);
    }

    #[cfg(not(target_os = "windows"))]
    None
}

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
