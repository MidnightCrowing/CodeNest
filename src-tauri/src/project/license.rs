use std::{fs, path::Path};

use serde::Serialize;

use super::path_safety::is_protected_system_path;

const LICENSE_LINE_LIMIT: usize = 100;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseReadResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    snippet: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    lines: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

#[tauri::command]
pub fn read_project_license(folder_path: String, max_lines: Option<usize>) -> LicenseReadResult {
    let root = Path::new(&folder_path);

    if !root.is_absolute() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("Path must be absolute".to_string()),
        };
    }

    let canonical_path = match root.canonicalize() {
        Ok(path) => path,
        Err(_) => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some("Cannot access path".to_string()),
            };
        }
    };

    if is_protected_system_path(&canonical_path) {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("Cannot read from system directory".to_string()),
        };
    }

    if !root.is_dir() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("Project path does not exist or is not a directory".to_string()),
        };
    }

    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(error) => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some(error.to_string()),
            };
        }
    };

    let mut candidates = entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            let file_name = path.file_name()?.to_string_lossy().into_owned();
            let lower = file_name.to_ascii_lowercase();
            (lower.starts_with("license")
                || lower.starts_with("licence")
                || lower.starts_with("copying")
                || lower.starts_with("unlicense"))
            .then_some((file_name, path))
        })
        .collect::<Vec<_>>();

    if candidates.is_empty() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("License file not found".to_string()),
        };
    }

    candidates.sort_by_key(|(file_name, _)| license_rank(file_name));
    let (file_name, path) = candidates.remove(0);
    if !path.is_file() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("License file is not a regular file".to_string()),
        };
    }

    // 检查文件大小,限制最大 1MB
    const MAX_LICENSE_SIZE: u64 = 1024 * 1024;
    match fs::metadata(&path) {
        Ok(metadata) if metadata.len() > MAX_LICENSE_SIZE => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some(format!("License file too large: {} bytes", metadata.len())),
            };
        }
        Err(error) => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some(error.to_string()),
            };
        }
        _ => {}
    }

    match fs::read_to_string(path) {
        Ok(content) => {
            let limit = max_lines.unwrap_or(20).clamp(1, LICENSE_LINE_LIMIT);
            let lines = content.lines().take(limit).collect::<Vec<_>>();
            LicenseReadResult {
                success: true,
                filename: Some(file_name),
                snippet: Some(lines.join("\n")),
                lines: Some(lines.len()),
                message: None,
            }
        }
        Err(error) => LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some(error.to_string()),
        },
    }
}

fn license_rank(file_name: &str) -> u8 {
    let lower = file_name.to_ascii_lowercase();
    let path = Path::new(&lower);
    let stem = path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .unwrap_or(&lower);
    let extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("");

    let base_score = if stem.starts_with("license") {
        0
    } else if stem.starts_with("licence") {
        1
    } else if stem.starts_with("copying") {
        2
    } else if stem.starts_with("unlicense") {
        3
    } else {
        9
    };
    let extension_score = match extension {
        "" => 0,
        "md" => 1,
        "txt" => 2,
        _ => 3,
    };

    base_score * 10 + extension_score
}
