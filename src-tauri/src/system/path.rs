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

#[cfg(test)]
mod tests {
    use std::{
        env,
        time::{SystemTime, UNIX_EPOCH},
    };

    use super::{check_path_existence, normalize_path_for_home_compare};

    #[test]
    #[cfg(windows)]
    fn normalize_path_for_home_compare_handles_windows_case_and_slashes() {
        assert_eq!(
            normalize_path_for_home_compare(r"C:\Users\Example\"),
            "c:/users/example"
        );
    }

    #[test]
    #[cfg(not(windows))]
    fn normalize_path_for_home_compare_preserves_unix_case() {
        assert_eq!(
            normalize_path_for_home_compare("/Users/Example/"),
            "/Users/Example"
        );
    }

    #[test]
    fn check_path_existence_reports_existing_paths() {
        let current_dir = env::current_dir().expect("current directory should be available");
        let result = check_path_existence(current_dir.to_string_lossy().into_owned());

        assert!(result.exists);
        assert!(result.error.is_none());
    }

    #[test]
    fn check_path_existence_reports_missing_paths_without_error() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be after epoch")
            .as_nanos();
        let missing_path = env::temp_dir().join(format!("codenest-missing-{unique}"));
        let result = check_path_existence(missing_path.to_string_lossy().into_owned());

        assert!(!result.exists);
        assert!(result.error.is_none());
    }
}
