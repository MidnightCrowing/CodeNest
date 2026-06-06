use std::{fs, path::PathBuf};

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

    if let Some(parent) = file_path.parent() {
        if let Err(error) = fs::create_dir_all(parent) {
            return BasicResult {
                success: false,
                error: Some(error.to_string()),
            };
        }
    }

    match serde_json::to_string_pretty(&json)
        .map_err(|e| e.to_string())
        .and_then(|content| fs::write(&file_path, content).map_err(|e| e.to_string()))
    {
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

    let content = match fs::read_to_string(&file_path) {
        Ok(content) => content,
        Err(error) => {
            return DataResult {
                success: false,
                data: None,
                error: Some(error.to_string()),
            };
        }
    };

    match serde_json::from_str::<serde_json::Value>(&content) {
        Ok(value) => DataResult {
            success: true,
            data: Some(value.to_string()),
            error: None,
        },
        Err(error) => DataResult {
            success: false,
            data: None,
            error: Some(error.to_string()),
        },
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
        if fs::write(&file_path, "{}").is_err() {
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
