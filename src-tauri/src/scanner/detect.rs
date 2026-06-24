use std::path::{Path, PathBuf};

use tauri::Manager;

pub(super) fn detect_jetbrains_config_root_path(app: tauri::AppHandle) -> Option<String> {
    let mut candidates = Vec::new();
    if cfg!(windows) {
        if let Ok(app_data) = app.path().app_data_dir() {
            let roaming = app_data
                .parent()
                .and_then(Path::parent)
                .map(|path| path.join("JetBrains"));
            if let Some(path) = roaming {
                candidates.push(path);
            }
        }
        if let Some(data_dir) = dirs::data_dir() {
            candidates.push(data_dir.join("JetBrains"));
        }
    } else if cfg!(target_os = "macos") {
        if let Some(home) = dirs::home_dir() {
            candidates.push(
                home.join("Library")
                    .join("Application Support")
                    .join("JetBrains"),
            );
        }
    } else if let Some(home) = dirs::home_dir() {
        candidates.push(home.join(".config").join("JetBrains"));
        candidates.push(home.join(".JetBrains"));
    }

    candidates
        .into_iter()
        .find(|path| path.is_dir())
        .map(|path| path.to_string_lossy().into_owned())
}

pub(super) fn detect_recent_editor_state_db_path(editor: &str) -> Option<String> {
    vscode_history_state_db_candidates(editor)
        .into_iter()
        .find(|path| path.is_file())
        .map(|path| path.to_string_lossy().into_owned())
}

pub(super) fn detect_cli_history_root_path(editor: &str) -> Option<String> {
    let dir_name = match editor {
        "codex-cli" => ".codex",
        "claude-code" => ".claude",
        "gemini-cli" => ".gemini",
        _ => return None,
    };
    dirs::home_dir()
        .map(|home| home.join(dir_name))
        .filter(|path| path.is_dir())
        .map(|path| path.to_string_lossy().into_owned())
}

fn vscode_history_state_db_candidates(editor: &str) -> Vec<PathBuf> {
    let app_names = match editor {
        "visual-studio-code" => &["Code"][..],
        "cursor" => &["Cursor", "cursor"][..],
        "windsurf" => &["Windsurf", "windsurf"][..],
        "trae" => &["Trae", "trae", "Trae CN", "TraeCN"][..],
        _ => return Vec::new(),
    };

    let mut candidates = Vec::new();
    if cfg!(windows) {
        if let Some(data_dir) = dirs::data_dir() {
            for app_name in app_names {
                candidates.push(vscode_history_state_db_path(&data_dir.join(app_name)));
            }
        }
    } else if cfg!(target_os = "macos") {
        if let Some(home) = dirs::home_dir() {
            let support = home.join("Library").join("Application Support");
            for app_name in app_names {
                candidates.push(vscode_history_state_db_path(&support.join(app_name)));
            }
        }
    } else if let Some(home) = dirs::home_dir() {
        let config = home.join(".config");
        for app_name in app_names {
            candidates.push(vscode_history_state_db_path(&config.join(app_name)));
        }
    }

    candidates
}

fn vscode_history_state_db_path(app_data_root: &Path) -> PathBuf {
    app_data_root
        .join("User")
        .join("globalStorage")
        .join("state.vscdb")
}

#[cfg(test)]
mod tests {
    use super::vscode_history_state_db_candidates;

    #[test]
    fn ignores_unknown_recent_editor_for_auto_detect() {
        assert!(vscode_history_state_db_candidates("unknown-editor").is_empty());
    }
}
