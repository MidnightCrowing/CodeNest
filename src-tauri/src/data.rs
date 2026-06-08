use std::{
    ffi::OsString,
    fs,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Clone, Copy, Deserialize)]
pub enum DataFileKind {
    #[serde(rename = "editorLangGroups")]
    EditorLangGroups,
    #[serde(rename = "projects")]
    Projects,
    #[serde(rename = "projectScanner")]
    ProjectScanner,
    #[serde(rename = "settings")]
    Settings,
}

#[derive(Serialize)]
pub struct BasicResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct DataResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

pub fn data_file_path(app: &AppHandle, file_type: DataFileKind) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_name = match file_type {
        DataFileKind::EditorLangGroups => "language-editor-map.json",
        DataFileKind::Projects => "projects.json",
        DataFileKind::ProjectScanner => "projects.scanner.json",
        DataFileKind::Settings => "settings.json",
    };
    Ok(dir.join(file_name))
}

pub fn projects_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    data_file_path(app, DataFileKind::Projects)
}

fn default_data_content(file_type: DataFileKind) -> &'static str {
    match file_type {
        DataFileKind::EditorLangGroups => "{}",
        DataFileKind::Projects => "[]",
        DataFileKind::ProjectScanner => r#"{"historyScannedPaths":[],"scanCache":[]}"#,
        DataFileKind::Settings => "{}",
    }
}

fn sibling_path_with_suffix(path: &Path, suffix: &str) -> PathBuf {
    let mut file_name = path
        .file_name()
        .map(|name| name.to_os_string())
        .unwrap_or_else(|| OsString::from("data.json"));
    file_name.push(suffix);
    path.with_file_name(file_name)
}

fn backup_file_path(path: &Path) -> PathBuf {
    sibling_path_with_suffix(path, ".bak")
}

fn temp_file_path(path: &Path) -> PathBuf {
    sibling_path_with_suffix(path, ".tmp")
}

fn read_json_file_content(path: &Path) -> Result<String, String> {
    let content = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let value =
        serde_json::from_str::<serde_json::Value>(&content).map_err(|error| error.to_string())?;
    Ok(value.to_string())
}

fn backup_existing_json_file(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }

    let content = match read_json_file_content(path) {
        Ok(content) => content,
        Err(_) => return Ok(()),
    };

    fs::write(backup_file_path(path), content).map_err(|error| error.to_string())
}

fn restore_backup_file(path: &Path) -> Result<(), String> {
    let backup_path = backup_file_path(path);
    if !backup_path.exists() {
        return Ok(());
    }

    if path.exists() {
        fs::remove_file(path).map_err(|error| error.to_string())?;
    }
    fs::copy(backup_path, path)
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn replace_with_temp_file(temp_path: &Path, target_path: &Path) -> Result<(), String> {
    #[cfg(windows)]
    {
        if target_path.exists() {
            fs::remove_file(target_path).map_err(|error| error.to_string())?;
        }
    }

    fs::rename(temp_path, target_path).map_err(|error| error.to_string())
}

pub fn write_data_file_safely(path: &Path, content: &str) -> Result<(), String> {
    serde_json::from_str::<serde_json::Value>(content).map_err(|error| error.to_string())?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let temp_path = temp_file_path(path);
    fs::write(&temp_path, content).map_err(|error| error.to_string())?;
    read_json_file_content(&temp_path)?;
    backup_existing_json_file(path)?;

    if let Err(error) = replace_with_temp_file(&temp_path, path) {
        let _ = restore_backup_file(path);
        let _ = fs::remove_file(temp_path);
        return Err(error);
    }

    Ok(())
}

#[tauri::command]
pub fn save_data(app: AppHandle, file_type: DataFileKind, data: String) -> BasicResult {
    let file_path = match data_file_path(&app, file_type) {
        Ok(path) => path,
        Err(error) => {
            return BasicResult {
                success: false,
                error: Some(error),
            }
        }
    };

    let json: serde_json::Value = match serde_json::from_str(&data) {
        Ok(value) => value,
        Err(error) => {
            return BasicResult {
                success: false,
                error: Some(error.to_string()),
            };
        }
    };

    let content = match serde_json::to_string_pretty(&json) {
        Ok(content) => content,
        Err(error) => {
            return BasicResult {
                success: false,
                error: Some(error.to_string()),
            };
        }
    };

    match write_data_file_safely(&file_path, &content) {
        Ok(_) => BasicResult {
            success: true,
            error: None,
        },
        Err(error) => BasicResult {
            success: false,
            error: Some(error),
        },
    }
}

#[tauri::command]
pub fn load_data(app: AppHandle, file_type: DataFileKind) -> DataResult {
    let file_path = match data_file_path(&app, file_type) {
        Ok(path) => path,
        Err(error) => {
            return DataResult {
                success: false,
                data: None,
                error: Some(error),
            };
        }
    };

    let content = match read_json_file_content(&file_path) {
        Ok(content) => content,
        Err(primary_error) => {
            let backup_path = backup_file_path(&file_path);
            match read_json_file_content(&backup_path) {
                Ok(content) => {
                    let _ = write_data_file_safely(&file_path, &content);
                    content
                }
                Err(backup_error) => {
                    return DataResult {
                        success: false,
                        data: None,
                        error: Some(format!(
                            "{primary_error}; backup recovery failed: {backup_error}"
                        )),
                    };
                }
            }
        }
    };

    DataResult {
        success: true,
        data: Some(content),
        error: None,
    }
}

#[tauri::command]
pub fn open_data(app: AppHandle, file_type: DataFileKind) -> bool {
    let Ok(file_path) = data_file_path(&app, file_type) else {
        return false;
    };

    if !file_path.exists() {
        if let Some(parent) = file_path.parent() {
            if fs::create_dir_all(parent).is_err() {
                return false;
            }
        }
        if write_data_file_safely(&file_path, default_data_content(file_type)).is_err() {
            return false;
        }
    }

    open::that(file_path).is_ok()
}

#[tauri::command]
pub fn delete_data(app: AppHandle, file_type: DataFileKind) -> BasicResult {
    let file_path = match data_file_path(&app, file_type) {
        Ok(path) => path,
        Err(error) => {
            return BasicResult {
                success: false,
                error: Some(error),
            }
        }
    };

    if !file_path.exists() {
        return BasicResult {
            success: true,
            error: None,
        };
    }

    match fs::remove_file(file_path) {
        Ok(_) => BasicResult {
            success: true,
            error: None,
        },
        Err(error) => BasicResult {
            success: false,
            error: Some(error.to_string()),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temp_data_path(file_name: &str) -> PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock should be after UNIX_EPOCH")
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("codenest-data-test-{timestamp}"));
        fs::create_dir_all(&dir).expect("test temp dir should be created");
        dir.join(file_name)
    }

    fn cleanup(path: &Path) {
        if let Some(parent) = path.parent() {
            let _ = fs::remove_dir_all(parent);
        }
    }

    #[test]
    fn write_data_file_safely_replaces_json_and_keeps_backup() {
        let path = temp_data_path("projects.json");
        fs::write(&path, r#"{"old":true}"#).expect("initial JSON should be written");

        write_data_file_safely(&path, r#"{"new":true}"#).expect("safe write should succeed");

        assert_eq!(
            read_json_file_content(&path).expect("new JSON should be readable"),
            r#"{"new":true}"#
        );
        assert_eq!(
            read_json_file_content(&backup_file_path(&path))
                .expect("backup JSON should be readable"),
            r#"{"old":true}"#
        );

        cleanup(&path);
    }

    #[test]
    fn write_data_file_safely_rejects_invalid_json() {
        let path = temp_data_path("settings.json");

        let result = write_data_file_safely(&path, "{invalid-json");

        assert!(result.is_err());
        assert!(!path.exists());

        cleanup(&path);
    }
}
