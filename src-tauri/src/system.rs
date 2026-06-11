use std::{
    fs, io,
    path::{Path, PathBuf},
    process::Command,
};

use serde::Serialize;

use crate::command_line::parse_command_line;

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

    let file_path_for_compare = normalize_path_for_home_compare(&file_path);
    let home_for_compare = normalize_path_for_home_compare(&home);
    if file_path_for_compare == home_for_compare {
        return "~".to_string();
    }

    let Some(normalized_remainder) = file_path_for_compare.strip_prefix(&home_for_compare) else {
        return file_path;
    };

    if !normalized_remainder.starts_with('/') {
        return file_path;
    }

    let remainder = &file_path[home_for_compare.len()..];
    format!("~{remainder}")
}

#[cfg(target_os = "windows")]
fn normalize_path_for_home_compare(path: &str) -> String {
    path.replace('\\', "/")
        .trim_end_matches('/')
        .to_ascii_lowercase()
}

#[cfg(not(target_os = "windows"))]
fn normalize_path_for_home_compare(path: &str) -> String {
    path.replace('\\', "/").trim_end_matches('/').to_string()
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
pub fn open_in_terminal(path: String, terminal_command: Option<String>) -> Result<String, String> {
    let path = PathBuf::from(path);
    if !path.is_dir() {
        return Err("Project path is not a directory".to_string());
    }

    if let Some(command) = terminal_command
        .as_deref()
        .map(str::trim)
        .filter(|cmd| !cmd.is_empty())
    {
        spawn_configured_terminal(command, &path)?;
    } else {
        spawn_default_terminal(&path)?;
    }

    Ok("Terminal opened".to_string())
}

fn spawn_configured_terminal(command_template: &str, cwd: &Path) -> Result<(), String> {
    let args = configured_terminal_args(command_template, cwd)?;
    let program = PathBuf::from(&args[0]);
    spawn_terminal_program(&program, &args[1..], cwd)
}

fn configured_terminal_args(command_template: &str, cwd: &Path) -> Result<Vec<String>, String> {
    let mut args = parse_command_line(command_template)?;

    let cwd_text = cwd.to_string_lossy().into_owned();
    for arg in &mut args {
        // 占位符替换发生在 parse_command_line 之后,替换结果作为单个
        // 参数直接传给 Command::args,不经过 shell 解析,无需再转义。
        *arg = arg
            .replace("{cwd}", &cwd_text)
            .replace("{project}", &cwd_text);
    }

    Ok(args)
}

fn spawn_terminal_program(program: &Path, args: &[String], cwd: &Path) -> Result<(), String> {
    if cfg!(windows) {
        if let Some(shell) = windows_shell_program_name(program) {
            return spawn_windows_shell_terminal(&shell, args, cwd);
        }

        let extension = program
            .extension()
            .and_then(|extension| extension.to_str())
            .map(str::to_ascii_lowercase);
        if matches!(extension.as_deref(), Some("bat" | "cmd")) {
            let mut command = Command::new("cmd");
            command.current_dir(cwd);
            command.args(["/C", "start", "", &program.to_string_lossy()]);
            command.args(args);
            command.spawn().map_err(|error| error.to_string())?;
            return Ok(());
        }
    }

    Command::new(program)
        .current_dir(cwd)
        .args(args)
        .spawn()
        .map(|_| ())
        .map_err(|error| format_spawn_error(program, error))
}

fn format_spawn_error(program: &Path, error: io::Error) -> String {
    if error.kind() == io::ErrorKind::NotFound {
        return format!("Command not found: {}", program.to_string_lossy());
    }

    error.to_string()
}

fn windows_shell_program_name(program: &Path) -> Option<String> {
    let name = program
        .file_stem()
        .or_else(|| program.file_name())
        .and_then(|name| name.to_str())?
        .to_ascii_lowercase();

    matches!(name.as_str(), "cmd" | "powershell" | "pwsh").then_some(name)
}

fn spawn_windows_shell_terminal(shell: &str, args: &[String], cwd: &Path) -> Result<(), String> {
    let mut command = Command::new("cmd");
    command.current_dir(cwd);
    command.args(["/C", "start", "", shell]);

    if args.is_empty() {
        if shell == "cmd" {
            command.arg("/K");
        } else {
            command.arg("-NoExit");
        }
    } else {
        command.args(args);
    }

    command
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn spawn_default_terminal(cwd: &Path) -> Result<(), String> {
    if cfg!(windows) {
        spawn_default_windows_terminal(cwd)
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .arg("-a")
            .arg("Terminal")
            .arg(cwd)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    } else {
        Command::new("x-terminal-emulator")
            .current_dir(cwd)
            .spawn()
            .or_else(|_| Command::new("gnome-terminal").current_dir(cwd).spawn())
            .or_else(|_| Command::new("konsole").current_dir(cwd).spawn())
            .map(|_| ())
            .map_err(|error| error.to_string())
    }
}

fn spawn_default_windows_terminal(cwd: &Path) -> Result<(), String> {
    let cwd_text = cwd.to_string_lossy();
    let mut errors = Vec::new();

    match Command::new("wt").arg("-d").arg(cwd).spawn() {
        Ok(_) => return Ok(()),
        Err(error) => errors.push(format!("wt: {error}")),
    }

    let powershell_command = format!(
        "Set-Location -LiteralPath '{}'",
        cwd_text.replace('\'', "''")
    );
    match Command::new("pwsh")
        .args(["-NoExit", "-Command", &powershell_command])
        .spawn()
    {
        Ok(_) => return Ok(()),
        Err(error) => errors.push(format!("pwsh: {error}")),
    }

    match Command::new("powershell")
        .args(["-NoExit", "-Command", &powershell_command])
        .spawn()
    {
        Ok(_) => return Ok(()),
        Err(error) => errors.push(format!("powershell: {error}")),
    }

    match Command::new("cmd")
        .current_dir(cwd)
        .args(["/C", "start", "", "cmd", "/K"])
        .spawn()
    {
        Ok(_) => Ok(()),
        Err(error) => {
            errors.push(format!("cmd: {error}"));
            Err(format!("Failed to open terminal: {}", errors.join("; ")))
        }
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::configured_terminal_args;

    #[test]
    fn configured_terminal_args_keeps_cwd_with_spaces_as_one_arg() {
        let args =
            configured_terminal_args("wt -d {cwd}", Path::new(r"E:\Projects\Example App")).unwrap();

        assert_eq!(args, vec!["wt", "-d", r"E:\Projects\Example App"]);
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
        read_windows_accent_palette_color(current_theme)
            .or_else(read_windows_accent_color_menu)
            .or_else(read_windows_dwm_accent_color)
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
