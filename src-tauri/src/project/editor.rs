mod detect;
mod launch;

use std::path::PathBuf;

#[tauri::command]
pub fn open_project(
    editor_command: String,
    project_path: String,
    open_in_terminal: Option<bool>,
) -> Result<String, String> {
    if editor_command.trim().is_empty() || project_path.is_empty() {
        return Err("Editor command and project path cannot be empty".to_string());
    }

    let project = PathBuf::from(&project_path);
    if !project.is_absolute() {
        return Err("Project path must be absolute".to_string());
    }

    if !project.exists() {
        return Err("Project path does not exist".to_string());
    }

    launch::open_project(&editor_command, &project, open_in_terminal.unwrap_or(false))?;
    Ok("Project opened".to_string())
}

/// 打开远程 SSH 项目:VS Code 系走 Remote-SSH,终端走 ssh -t。
///
/// 远程项目没有本地路径,故不做 `is_absolute()/exists()` 校验;
/// 认证/端口/密钥由用户的 ~/.ssh/config 与 ssh 负责。
#[tauri::command]
pub fn open_remote_project(
    host: String,
    remote_path: String,
    editor_command: String,
    mode: String,
) -> Result<String, String> {
    launch::open_remote_project(&host, &remote_path, &editor_command, &mode)?;
    Ok("Remote project opened".to_string())
}

#[tauri::command]
pub fn detect_editor_command(editor: String) -> Option<String> {
    detect::detect_editor_command_template(&editor)
}
