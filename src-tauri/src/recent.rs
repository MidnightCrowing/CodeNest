use std::{
    collections::HashSet,
    fs,
    io::{BufRead, BufReader},
    path::{Path, PathBuf},
};

use percent_encoding::percent_decode_str;
use rusqlite::{Connection, OpenFlags};
use serde::Deserialize;
use serde_json::Value;
use url::Url;

use crate::analyzer::{canonical_or_original, display_path, normalize_path_key};

#[derive(Clone)]
pub struct RecentProject {
    pub path: String,
    pub ide: Option<String>,
}

pub fn collect_from_jetbrains(config_root: Option<&str>) -> Vec<RecentProject> {
    let Some(config_root) = config_root.filter(|path| !path.is_empty()) else {
        return Vec::new();
    };
    let root = Path::new(config_root);
    if !root.is_dir() {
        return Vec::new();
    }

    let mut candidates = Vec::new();
    let home = dirs::home_dir().unwrap_or_default();
    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(_) => return Vec::new(),
    };

    for entry in entries.flatten() {
        let product_dir = entry.path();
        if !product_dir.is_dir() {
            continue;
        }

        let xml_path = product_dir.join("options").join("recentProjects.xml");
        let Ok(xml) = fs::read_to_string(xml_path) else {
            continue;
        };
        let Ok(document) = roxmltree::Document::parse(&xml) else {
            continue;
        };

        let ide = entry
            .file_name()
            .to_string_lossy()
            .split(char::is_numeric)
            .next()
            .and_then(map_jetbrains_ide);

        for option in document.descendants().filter(|node| {
            node.has_tag_name("option") && node.attribute("name") == Some("additionalInfo")
        }) {
            for project_entry in option
                .descendants()
                .filter(|node| node.has_tag_name("entry"))
            {
                let Some(raw_path) = project_entry.attribute("key") else {
                    continue;
                };
                if raw_path.contains('$')
                    || raw_path.contains("light-edit")
                    || raw_path.contains("scratches")
                {
                    continue;
                }
                let normalized = normalize_jetbrains_path(raw_path, &home);
                candidates.push(RecentProject {
                    path: normalized,
                    ide: ide.clone(),
                });
            }
        }
    }

    uniq_existing_dirs(candidates)
}

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

pub fn collect_from_codex(config_root: Option<&str>) -> Vec<RecentProject> {
    collect_cwd_history(config_root, &["sessions"], "codex-cli")
}

pub fn collect_from_claude(config_root: Option<&str>) -> Vec<RecentProject> {
    collect_cwd_history(config_root, &["projects"], "claude-code")
}

pub fn collect_from_gemini(config_root: Option<&str>) -> Vec<RecentProject> {
    collect_cwd_history(config_root, &["tmp", "sessions", "history"], "gemini-cli")
}

fn collect_cwd_history(
    config_root: Option<&str>,
    preferred_dirs: &[&str],
    ide: &str,
) -> Vec<RecentProject> {
    let Some(config_root) = config_root.filter(|path| !path.is_empty()) else {
        return Vec::new();
    };
    let root = Path::new(config_root);
    if !root.is_dir() {
        return Vec::new();
    }

    let mut files = Vec::new();
    for dir in preferred_dirs {
        collect_json_history_files(&root.join(dir), &mut files);
    }
    if files.is_empty() || ide == "gemini-cli" {
        collect_json_history_files(root, &mut files);
    }
    files.sort();
    files.dedup();

    files.sort_by(|a, b| {
        modified_millis(b)
            .cmp(&modified_millis(a))
            .then_with(|| a.cmp(b))
    });

    let candidates = files
        .into_iter()
        .take(500)
        .filter_map(|path| extract_cwd_from_history_file(&path))
        .map(|path| RecentProject {
            path,
            ide: Some(ide.to_string()),
        })
        .collect();

    uniq_existing_dirs(candidates)
}

fn collect_json_history_files(root: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(root) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_json_history_files(&path, out);
            continue;
        }

        if matches!(
            path.extension().and_then(|extension| extension.to_str()),
            Some("jsonl" | "json")
        ) {
            out.push(path);
        }
    }
}

fn extract_cwd_from_history_file(path: &Path) -> Option<String> {
    match path.extension().and_then(|extension| extension.to_str()) {
        Some("jsonl") => extract_cwd_from_jsonl(path),
        Some("json") => extract_cwd_from_json_file(path),
        _ => None,
    }
}

fn extract_cwd_from_jsonl(path: &Path) -> Option<String> {
    let file = fs::File::open(path).ok()?;
    let reader = BufReader::new(file);
    for line in reader.lines().map_while(Result::ok).take(80) {
        let Ok(value) = serde_json::from_str::<Value>(&line) else {
            continue;
        };
        if let Some(cwd) = find_cwd_in_json(&value) {
            return Some(cwd);
        }
    }
    None
}

fn extract_cwd_from_json_file(path: &Path) -> Option<String> {
    if fs::metadata(path).ok()?.len() > 2 * 1024 * 1024 {
        return None;
    }
    let value = serde_json::from_str::<Value>(&fs::read_to_string(path).ok()?).ok()?;
    find_cwd_in_json(&value)
}

fn find_cwd_in_json(value: &Value) -> Option<String> {
    match value {
        Value::Object(map) => {
            if let Some(path) = map
                .get("cwd")
                .or_else(|| map.get("workingDirectory"))
                .or_else(|| map.get("workspaceRoot"))
                .and_then(Value::as_str)
                .filter(|path| !path.trim().is_empty())
            {
                return Some(path.to_string());
            }

            for child in map.values() {
                if let Some(path) = find_cwd_in_json(child) {
                    return Some(path);
                }
            }
            None
        }
        Value::Array(items) => items.iter().find_map(find_cwd_in_json),
        _ => None,
    }
}

fn modified_millis(path: &Path) -> u128 {
    path.metadata()
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}

fn uniq_existing_dirs(items: Vec<RecentProject>) -> Vec<RecentProject> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();

    for item in items {
        let path = PathBuf::from(&item.path);
        if !path.is_dir() {
            continue;
        }
        let canonical = canonical_or_original(&path);
        let key = normalize_path_key(&canonical);
        if seen.insert(key) {
            out.push(RecentProject {
                path: display_path(&canonical),
                ide: item.ide,
            });
        }
    }

    out
}

fn normalize_jetbrains_path(raw_path: &str, home: &Path) -> String {
    let with_home = raw_path.replace("$USER_HOME$", &home.to_string_lossy());
    if cfg!(windows) {
        with_home.replace('/', "\\")
    } else {
        with_home
    }
}

fn map_jetbrains_ide(raw_name: &str) -> Option<String> {
    let value = match raw_name {
        "IntelliJIdea" => "intellij-idea",
        "PyCharm" => "pycharm",
        "PhpStorm" => "phpstorm",
        "GoLand" => "goLand",
        "Rider" => "rider",
        "CLion" => "clion",
        "RustRover" => "rust-rover",
        "WebStorm" => "webstorm",
        "RubyMine" => "rubymine",
        "AndroidStudio" => "android-studio",
        _ => return None,
    };
    Some(value.to_string())
}

fn file_uri_to_path(uri: &str) -> Option<String> {
    if !uri.starts_with("file://") {
        return None;
    }

    if let Ok(url) = Url::parse(uri) {
        if let Ok(path) = url.to_file_path() {
            return Some(path.to_string_lossy().into_owned());
        }
    }

    let stripped = uri.strip_prefix("file://")?;
    let decoded = percent_decode_str(stripped).decode_utf8().ok()?;
    if cfg!(windows) {
        Some(decoded.trim_start_matches('/').replace('/', "\\"))
    } else {
        Some(format!("/{decoded}"))
    }
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

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use serde_json::json;

    use super::*;

    #[test]
    fn collects_codex_cwd_from_jsonl_payload() {
        let root = unique_temp_dir("codex-cwd");
        let project = root.join("project");
        let config = root.join("config");
        let sessions = config.join("sessions");
        fs::create_dir_all(&project).expect("project dir should be created");
        fs::create_dir_all(&sessions).expect("sessions dir should be created");
        fs::write(
            sessions.join("session.jsonl"),
            format!(
                "{}\n",
                json!({
                    "type": "session_meta",
                    "payload": {
                        "cwd": project.to_string_lossy()
                    }
                })
            ),
        )
        .expect("session file should be written");

        let config_string = config.to_string_lossy().into_owned();
        let items = collect_from_codex(Some(&config_string));
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].ide.as_deref(), Some("codex-cli"));
        assert_eq!(
            normalize_path_key(Path::new(&items[0].path)),
            normalize_path_key(&project)
        );

        let _ = fs::remove_dir_all(root);
    }

    fn unique_temp_dir(label: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be valid")
            .as_nanos();
        std::env::temp_dir().join(format!("codenest-{label}-{}-{unique}", std::process::id()))
    }
}
