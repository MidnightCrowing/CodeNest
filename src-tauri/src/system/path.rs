use std::fs;

use super::PathExistenceResult;

pub(super) fn format_path(file_path: String) -> String {
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

pub(super) fn check_path_existence(path: String) -> PathExistenceResult {
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
