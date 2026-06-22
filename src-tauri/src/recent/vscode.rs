use std::path::Path;

use rusqlite::{Connection, OpenFlags};
use serde::Deserialize;

use super::{
    common::{file_uri_to_path, uniq_existing_dirs},
    models::RecentProject,
};

pub fn collect_from_vscode(db_path: Option<&str>) -> Vec<RecentProject> {
    let Some(db_path) = db_path.filter(|path| !path.is_empty()) else {
        return Vec::new();
    };
    if !Path::new(db_path).is_file() {
        return Vec::new();
    }

    let connection = match Connection::open_with_flags(db_path, OpenFlags::SQLITE_OPEN_READ_ONLY) {
        Ok(connection) => connection,
        Err(_) => return Vec::new(),
    };

    // 设置忙等待超时和查询超时,避免数据库锁定或慢查询阻塞
    let _ = connection.busy_timeout(std::time::Duration::from_millis(500));
    // pragma_update 返回 Result<T, Error>,需要处理
    let _ = connection.pragma_update(None, "query_only", true);

    let value: Option<String> = connection
        .query_row(
            "SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'",
            [],
            |row| row.get(0),
        )
        .ok();

    let Some(value) = value else {
        return Vec::new();
    };
    let Ok(history) = serde_json::from_str::<VscodeHistory>(&value) else {
        return Vec::new();
    };

    let mut candidates = Vec::new();
    for entry in history.entries {
        if entry.remote_authority.is_some() {
            continue;
        }

        if let Some(path) = entry.folder_uri.as_deref().and_then(file_uri_to_path) {
            candidates.push(RecentProject { path, ide: None });
            continue;
        }

        if let Some(workspace) = entry.workspace {
            if let Some(config_path) = workspace.config_path() {
                if let Some(path) = file_uri_to_path(config_path) {
                    if let Some(parent) = Path::new(&path).parent() {
                        candidates.push(RecentProject {
                            path: parent.to_string_lossy().into_owned(),
                            ide: None,
                        });
                    }
                }
            }
            continue;
        }

        if let Some(path) = entry.file_uri.as_deref().and_then(file_uri_to_path) {
            if let Some(parent) = Path::new(&path).parent() {
                candidates.push(RecentProject {
                    path: parent.to_string_lossy().into_owned(),
                    ide: None,
                });
            }
        }
    }

    uniq_existing_dirs(candidates)
}

#[derive(Deserialize)]
struct VscodeHistory {
    #[serde(default)]
    entries: Vec<VscodeRecentEntry>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VscodeRecentEntry {
    folder_uri: Option<String>,
    file_uri: Option<String>,
    workspace: Option<VscodeWorkspace>,
    remote_authority: Option<String>,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum VscodeWorkspace {
    Object { config_path: String },
    String(String),
}

impl VscodeWorkspace {
    fn config_path(&self) -> Option<&str> {
        match self {
            VscodeWorkspace::Object { config_path } => Some(config_path),
            VscodeWorkspace::String(value) => Some(value),
        }
    }
}
