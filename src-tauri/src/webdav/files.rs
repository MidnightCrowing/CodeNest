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
