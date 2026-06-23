use std::{
    fs,
    io::{BufRead, BufReader},
    path::{Path, PathBuf},
};

use serde_json::Value;

use super::{
    common::{modified_millis, uniq_existing_dirs},
    models::RecentProject,
};

const MAX_CLI_HISTORY_JSON_SIZE: u64 = 512 * 1024;
const MAX_JSON_DEPTH: usize = 32;
const MAX_JSONL_LINE_SIZE: usize = 64 * 1024;
const MAX_JSONL_LINES: usize = 80;
const MAX_RECENT_FILES: usize = 500;

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
        .take(MAX_RECENT_FILES)
        .filter_map(|path| extract_cwd_from_history_file(&path))
        .map(|path| RecentProject {
            path,
            ide: Some(ide.to_string()),
        })
        .collect();

    uniq_existing_dirs(candidates)
}

fn collect_json_history_files(root: &Path, out: &mut Vec<PathBuf>) {
    const MAX_FILES: usize = 1000;
    if out.len() >= MAX_FILES {
        return;
    }

    let Ok(entries) = fs::read_dir(root) else {
        return;
    };

    for entry in entries.flatten() {
        if out.len() >= MAX_FILES {
            break;
        }
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
    for line in reader.lines().take(MAX_JSONL_LINES).map_while(Result::ok) {
        if line.len() > MAX_JSONL_LINE_SIZE {
            continue;
        }
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
    if fs::metadata(path).ok()?.len() > MAX_CLI_HISTORY_JSON_SIZE {
        return None;
    }
    let value = serde_json::from_str::<Value>(&fs::read_to_string(path).ok()?).ok()?;
    find_cwd_in_json_impl(&value, 0)
}

fn find_cwd_in_json(value: &Value) -> Option<String> {
    find_cwd_in_json_impl(value, 0)
}

fn find_cwd_in_json_impl(value: &Value, depth: usize) -> Option<String> {
    if depth > MAX_JSON_DEPTH {
        return None;
    }

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
                if let Some(path) = find_cwd_in_json_impl(child, depth + 1) {
                    return Some(path);
                }
            }
            None
        }
        Value::Array(items) => items
            .iter()
            .find_map(|v| find_cwd_in_json_impl(v, depth + 1)),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use serde_json::json;

    use crate::analyzer::normalize_path_key;

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
