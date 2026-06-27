use std::{
    fs,
    path::{Path, PathBuf},
};

use serde::Serialize;
use tauri::AppHandle;

use crate::{
    analyzer::{self, LinguistResult},
    data,
    scanner::git::{detect_project_git_metadata as detect_git_metadata, ProjectGitMetadata},
};

use super::path_safety::is_protected_system_path;

#[derive(Serialize)]
pub struct ProjectMutationResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[tauri::command]
pub async fn analyze_project(folder_path: String) -> Result<LinguistResult, String> {
    let path = Path::new(&folder_path);

    if !path.is_absolute() {
        return Err("Path must be absolute".to_string());
    }

    let canonical_path = path
        .canonicalize()
        .map_err(|_| "Cannot access path".to_string())?;

    if is_protected_system_path(&canonical_path) {
        return Err("Cannot analyze system directory".to_string());
    }

    tauri::async_runtime::spawn_blocking(move || analyzer::analyze_folder(Path::new(&folder_path)))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn get_language_color(language_name: String) -> Option<String> {
    analyzer::language_color(language_name.trim()).map(ToOwned::to_owned)
}

#[tauri::command]
pub fn detect_project_git_metadata(folder_path: String) -> Option<ProjectGitMetadata> {
    detect_git_metadata(Path::new(&folder_path))
}

#[tauri::command]
pub fn delete_project(project_path: String) -> ProjectMutationResult {
    let path = PathBuf::from(&project_path);
    if !path.exists() {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Project path does not exist".to_string()),
        };
    }

    if !path.is_absolute() {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Path must be absolute".to_string()),
        };
    }

    let canonical_path = match path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some("Cannot access path".to_string()),
            };
        }
    };

    if is_protected_system_path(&canonical_path) {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Cannot delete system directory".to_string()),
        };
    }

    if trash::delete(&path).is_ok() {
        return ProjectMutationResult {
            success: true,
            message: Some("Project moved to trash".to_string()),
            error: None,
        };
    }

    let result = if path.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    };

    match result {
        Ok(_) => ProjectMutationResult {
            success: true,
            message: Some("Project deleted".to_string()),
            error: None,
        },
        Err(error) => ProjectMutationResult {
            success: false,
            message: None,
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn import_projects(app: AppHandle) -> ProjectMutationResult {
    let Some(imported_path) = rfd::FileDialog::new()
        .add_filter("JSON Files", &["json"])
        .pick_file()
    else {
        return ProjectMutationResult {
            success: false,
            message: Some("No file selected for import".to_string()),
            error: None,
        };
    };

    let target = match data::projects_file_path(&app) {
        Ok(path) => path,
        Err(error) => {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some(error),
            };
        }
    };
    if let Some(parent) = target.parent() {
        if let Err(error) = fs::create_dir_all(parent) {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some(error.to_string()),
            };
        }
    }

    match fs::copy(imported_path, target) {
        Ok(_) => ProjectMutationResult {
            success: true,
            message: Some("Data file imported successfully".to_string()),
            error: None,
        },
        Err(error) => ProjectMutationResult {
            success: false,
            message: None,
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn export_projects(app: AppHandle) -> ProjectMutationResult {
    let Some(exported_path) = rfd::FileDialog::new()
        .set_file_name("projects.json")
        .add_filter("JSON Files", &["json"])
        .save_file()
    else {
        return ProjectMutationResult {
            success: false,
            message: Some("No file path selected for export".to_string()),
            error: None,
        };
    };

    let source = match data::projects_file_path(&app) {
        Ok(path) => path,
        Err(error) => {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some(error),
            };
        }
    };

    match fs::copy(source, exported_path) {
        Ok(_) => ProjectMutationResult {
            success: true,
            message: Some("Data file exported successfully".to_string()),
            error: None,
        },
        Err(error) => ProjectMutationResult {
            success: false,
            message: None,
            error: Some(error.to_string()),
        },
    }
}
