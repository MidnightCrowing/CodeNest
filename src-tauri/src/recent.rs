use std::{
    collections::HashSet,
    fs,
    path::{Path, PathBuf},
};

use percent_encoding::percent_decode_str;
use rusqlite::{Connection, OpenFlags};
use serde::Deserialize;
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
