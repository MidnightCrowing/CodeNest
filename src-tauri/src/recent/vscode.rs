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

    // 忙等待/查询超时，避免 DB 锁或慢查询阻塞
    let _ = connection.busy_timeout(std::time::Duration::from_millis(500));
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
    Object {
        #[serde(rename = "configPath")]
        config_path: String,
    },
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

#[cfg(test)]
mod tests {
    use std::{
        fs,
        path::{Path, PathBuf},
        time::{SystemTime, UNIX_EPOCH},
    };

    use rusqlite::Connection;
    use serde_json::json;

    use crate::analyzer::normalize_path_key;

    use super::collect_from_vscode;

    fn unique_temp_dir(label: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be valid")
            .as_nanos();
        std::env::temp_dir().join(format!(
            "codenest-vscode-{label}-{}-{unique}",
            std::process::id()
        ))
    }

    fn path_to_file_uri(path: &Path) -> String {
        let url = url::Url::from_file_path(path).expect("path should convert to file uri");
        url.into()
    }

    fn write_vscdb(db_path: &Path, history_json: &str) {
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent).expect("db parent should be created");
        }
        let connection = Connection::open(db_path).expect("sqlite db should open");
        connection
            .execute(
                "CREATE TABLE ItemTable (key TEXT PRIMARY KEY, value TEXT)",
                [],
            )
            .expect("ItemTable should be created");
        connection
            .execute(
                "INSERT INTO ItemTable (key, value) VALUES (?1, ?2)",
                ("history.recentlyOpenedPathsList", history_json),
            )
            .expect("history row should be inserted");
    }

    #[test]
    fn collect_from_vscode_returns_empty_for_missing_db() {
        assert!(collect_from_vscode(None).is_empty());
        assert!(collect_from_vscode(Some("")).is_empty());
        assert!(collect_from_vscode(Some(r"E:\missing-state.vscdb")).is_empty());
    }

    #[test]
    fn collect_from_vscode_reads_folder_file_and_workspace_entries() {
        let root = unique_temp_dir("entries");
        let project = root.join("project");
        let file_project = root.join("file-project");
        let workspace_project = root.join("workspace-project");
        fs::create_dir_all(&project).expect("project dir should be created");
        fs::create_dir_all(&file_project).expect("file project dir should be created");
        fs::create_dir_all(&workspace_project).expect("workspace project dir should be created");

        let file_uri = path_to_file_uri(&file_project.join("main.ts"));
        let workspace_uri = path_to_file_uri(&workspace_project.join("demo.code-workspace"));
        let history = json!({
            "entries": [
                { "folderUri": path_to_file_uri(&project) },
                { "fileUri": file_uri },
                { "workspace": { "configPath": workspace_uri } },
                {
                    "folderUri": path_to_file_uri(&root.join("remote-only")),
                    "remoteAuthority": "ssh-remote+devbox"
                }
            ]
        })
        .to_string();

        let db_path = root.join("state.vscdb");
        write_vscdb(&db_path, &history);

        let mut items = collect_from_vscode(Some(&db_path.to_string_lossy()));
        items.sort_by(|a, b| a.path.cmp(&b.path));

        let paths: Vec<_> = items
            .iter()
            .map(|item| normalize_path_key(Path::new(&item.path)))
            .collect();

        assert!(paths.contains(&normalize_path_key(&project)));
        assert!(paths.contains(&normalize_path_key(&file_project)));
        assert!(paths.contains(&normalize_path_key(&workspace_project)));
        assert_eq!(items.len(), 3);
        assert!(items.iter().all(|item| item.ide.is_none()));

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn collect_from_vscode_accepts_string_workspace_entries() {
        let root = unique_temp_dir("workspace-string");
        let workspace_project = root.join("ws");
        fs::create_dir_all(&workspace_project).expect("workspace dir should be created");
        let workspace_uri = path_to_file_uri(&workspace_project.join("app.code-workspace"));
        let history = json!({
            "entries": [
                { "workspace": workspace_uri }
            ]
        })
        .to_string();

        let db_path = root.join("state.vscdb");
        write_vscdb(&db_path, &history);

        let items = collect_from_vscode(Some(&db_path.to_string_lossy()));
        assert_eq!(items.len(), 1);
        assert_eq!(
            normalize_path_key(Path::new(&items[0].path)),
            normalize_path_key(&workspace_project)
        );

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn collect_from_vscode_returns_empty_for_invalid_history_json() {
        let root = unique_temp_dir("invalid-json");
        let db_path = root.join("state.vscdb");
        write_vscdb(&db_path, "{not-json");

        assert!(collect_from_vscode(Some(&db_path.to_string_lossy())).is_empty());

        let _ = fs::remove_dir_all(root);
    }
}
