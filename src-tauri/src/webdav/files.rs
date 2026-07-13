use std::{
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use serde_json::Value;
use tauri::{AppHandle, Manager};

use crate::data::{data_file_path, DataFileKind};

pub(super) struct SyncFile {
    pub(super) kind: DataFileKind,
    pub(super) name: &'static str,
    pub(super) fallback: &'static str,
}

pub(super) const SYNC_FILES: [SyncFile; 2] = [
    SyncFile {
        kind: DataFileKind::Settings,
        name: "settings.json",
        fallback: "{}",
    },
    SyncFile {
        kind: DataFileKind::Projects,
        name: "projects.json",
        fallback: "[]",
    },
];

pub(super) fn backup_local_sync_files(app: &AppHandle) -> Result<PathBuf, String> {
    let backup_root = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("backups")
        .join(format!(
            "webdav-pull-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map_err(|error| error.to_string())?
                .as_secs()
        ));
    fs::create_dir_all(&backup_root).map_err(|error| error.to_string())?;

    for file in SYNC_FILES {
        let source = data_file_path(app, file.kind)?;
        if source.exists() {
            fs::copy(source, backup_root.join(file.name)).map_err(|error| error.to_string())?;
        }
    }

    Ok(backup_root)
}

pub(super) fn prepare_upload_content(kind: DataFileKind, raw: &str) -> Result<String, String> {
    let mut value = parse_json(raw)?;
    if matches!(kind, DataFileKind::Settings) {
        if let Some(object) = value.as_object_mut() {
            object.remove("webdav");
        }
    }
    to_pretty_json(&value)
}

pub(super) fn prepare_pull_content(
    app: &AppHandle,
    kind: DataFileKind,
    raw: &str,
) -> Result<String, String> {
    let mut value = parse_json(raw)?;
    if matches!(kind, DataFileKind::Settings) {
        let local_path = data_file_path(app, DataFileKind::Settings)?;
        if local_path.exists() {
            let local = read_or_default(local_path, "{}")?;
            match parse_json(&local) {
                Ok(local_json) => {
                    if let Some(webdav) = local_json.get("webdav").cloned() {
                        if let Some(object) = value.as_object_mut() {
                            object.insert("webdav".to_string(), webdav);
                        }
                    }
                }
                Err(error) => {
                    // 本地 settings 损坏时跳过 webdav 合并(凭据可能丢失,
                    // 用户需重新配置),但记录原因便于排查。
                    eprintln!(
                        "[webdav] Local settings.json is corrupted, skipping webdav config merge: {error}"
                    );
                }
            }
        }
    }
    to_pretty_json(&value)
}

pub(super) fn read_or_default(path: PathBuf, fallback: &str) -> Result<String, String> {
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(fallback.to_string()),
        Err(error) => Err(error.to_string()),
    }
}

fn parse_json(raw: &str) -> Result<Value, String> {
    serde_json::from_str::<Value>(raw).map_err(|error| error.to_string())
}

fn to_pretty_json(value: &Value) -> Result<String, String> {
    serde_json::to_string_pretty(value).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use std::{
        fs,
        time::{SystemTime, UNIX_EPOCH},
    };

    use crate::data::DataFileKind;

    use super::{prepare_upload_content, read_or_default, SYNC_FILES};

    fn unique_temp_path(label: &str) -> std::path::PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be valid")
            .as_nanos();
        std::env::temp_dir().join(format!(
            "codenest-webdav-files-{label}-{}-{unique}",
            std::process::id()
        ))
    }

    #[test]
    fn sync_files_cover_settings_and_projects() {
        assert_eq!(SYNC_FILES.len(), 2);
        assert!(SYNC_FILES.iter().any(|file| file.name == "settings.json"));
        assert!(SYNC_FILES.iter().any(|file| file.name == "projects.json"));
    }

    #[test]
    fn prepare_upload_content_strips_webdav_from_settings() {
        let raw = r#"{"theme":"dark","webdav":{"endpoint":"https://dav.example.com","password":"secret"}}"#;
        let prepared =
            prepare_upload_content(DataFileKind::Settings, raw).expect("settings should prepare");
        let value: serde_json::Value =
            serde_json::from_str(&prepared).expect("prepared settings should be json");

        assert_eq!(value.get("theme").and_then(|v| v.as_str()), Some("dark"));
        assert!(value.get("webdav").is_none());
    }

    #[test]
    fn prepare_upload_content_preserves_projects_payload() {
        let raw = r#"[{"name":"CodeNest","path":"E:/Projects/CodeNest"}]"#;
        let prepared =
            prepare_upload_content(DataFileKind::Projects, raw).expect("projects should prepare");
        let value: serde_json::Value =
            serde_json::from_str(&prepared).expect("prepared projects should be json");

        assert!(value.is_array());
        assert_eq!(value.as_array().map(|items| items.len()), Some(1));
    }

    #[test]
    fn prepare_upload_content_rejects_invalid_json() {
        let error = prepare_upload_content(DataFileKind::Settings, "{not-json")
            .expect_err("invalid json should fail");
        assert!(!error.is_empty());
    }

    #[test]
    fn read_or_default_returns_fallback_for_missing_files() {
        let path = unique_temp_path("missing");
        let content = read_or_default(path, "[]").expect("missing file should use fallback");
        assert_eq!(content, "[]");
    }

    #[test]
    fn read_or_default_returns_file_contents_when_present() {
        let path = unique_temp_path("present");
        fs::write(&path, "{\"ok\":true}").expect("temp file should be written");
        let content = read_or_default(path.clone(), "{}").expect("existing file should be read");
        assert_eq!(content, "{\"ok\":true}");
        let _ = fs::remove_file(path);
    }
}
