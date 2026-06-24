use std::{
    collections::{HashMap, HashSet},
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    time::UNIX_EPOCH,
};

use ignore::WalkBuilder;

use crate::{
    analyzer::{self, LanguageStats, LanguageType},
    recent::{
        collect_from_claude, collect_from_codex, collect_from_gemini, collect_from_jetbrains,
        collect_from_vscode, RecentProject,
    },
};

use super::git;
use super::models::{
    LangGroupItem, ScanCacheEntry, ScanItem, ScanPayload, ScanResult, HISTORY_SCANNER_EDITORS,
};

const MAX_ROOT_SCAN_DEPTH: usize = 8;
pub(super) fn scan_projects(payload: ScanPayload) -> Result<ScanResult, String> {
    let mut candidates = Vec::new();

    if payload.ide_enabled {
        for editor in HISTORY_SCANNER_EDITORS {
            match *editor {
                "cursor" | "trae" | "windsurf" | "visual-studio-code" => {
                    let Some(config) = payload
                        .recent_editors
                        .get(*editor)
                        .filter(|config| config.enabled)
                    else {
                        continue;
                    };

                    candidates.extend(
                        collect_from_vscode(Some(&config.state_db_path))
                            .into_iter()
                            .map(|item| RecentProject {
                                path: item.path,
                                ide: Some((*editor).to_string()),
                            }),
                    );
                }
                "claude-code" | "codex-cli" | "gemini-cli" => {
                    let Some(config) = payload
                        .cli_editors
                        .get(*editor)
                        .filter(|config| config.enabled)
                    else {
                        continue;
                    };
                    let root = Some(config.history_root_path.as_str());
                    candidates.extend(match *editor {
                        "claude-code" => collect_from_claude(root),
                        "codex-cli" => collect_from_codex(root),
                        "gemini-cli" => collect_from_gemini(root),
                        _ => Vec::new(),
                    });
                }
                _ => {}
            }
        }
        if payload.jetbrains.enabled {
            candidates.extend(collect_from_jetbrains(Some(
                &payload.jetbrains.config_root_path,
            )));
        }
    }

    if payload.roots_enabled {
        let depth = payload.root_scan_depth.min(MAX_ROOT_SCAN_DEPTH);
        for root in &payload.roots {
            candidates.extend(
                collect_root_projects(Path::new(root), depth)
                    .into_iter()
                    .map(|path| RecentProject {
                        path: analyzer::display_path(&path),
                        ide: None,
                    }),
            );
        }
    }

    let existing = payload
        .existing_paths
        .iter()
        .map(|path| analyzer::normalize_path_key(Path::new(path)))
        .collect::<HashSet<_>>();
    let cache = payload
        .cache_entries
        .iter()
        .map(|entry| {
            (
                analyzer::normalize_path_key(Path::new(&entry.path)),
                entry.clone(),
            )
        })
        .collect::<HashMap<_, _>>();

    let max_scan_bytes = analyzer::max_scan_bytes();

    let mut seen = HashSet::new();
    let mut items = Vec::new();
    for candidate in candidates {
        let path = PathBuf::from(&candidate.path);
        if !path.is_dir() {
            continue;
        }

        let canonical = analyzer::canonical_or_original(&path);
        if !git::is_git_project(&canonical) {
            continue;
        }

        let key = analyzer::normalize_path_key(&canonical);
        if existing.contains(&key) || !seen.insert(key.clone()) {
            continue;
        }

        items.push(scan_one_project(
            canonical,
            candidate.ide,
            max_scan_bytes,
            cache.get(&key),
        ));
    }

    Ok(ScanResult { items })
}

fn scan_one_project(
    path: PathBuf,
    ide: Option<String>,
    max_scan_bytes: u64,
    cached: Option<&ScanCacheEntry>,
) -> ScanItem {
    let name = path
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .filter(|name| !name.is_empty())
        .unwrap_or_default();
    let path_string = analyzer::display_path(&path);
    let detected_kind = git::detect_project_kind(&path);

    match directory_state_capped(&path, max_scan_bytes) {
        Ok(state) if cached.is_some_and(|entry| entry.signature == state.signature) => {
            let cached = cached.expect("cache entry checked above");
            ScanItem {
                path: path_string,
                name: if cached.name.is_empty() {
                    name
                } else {
                    cached.name.clone()
                },
                main_lang: cached.main_lang.clone(),
                main_lang_color: cached.main_lang_color.clone(),
                lang_group: cached.lang_group.clone(),
                ide,
                detected_kind,
                error: cached.error.clone(),
                signature: Some(state.signature),
            }
        }
        Ok(state) if state.total_bytes > max_scan_bytes => ScanItem {
            path: path_string,
            name,
            main_lang: None,
            main_lang_color: None,
            lang_group: None,
            ide,
            detected_kind,
            error: Some(format!(
                "Directory too large ({} MB)",
                state.total_bytes / (1024 * 1024)
            )),
            signature: Some(state.signature),
        },
        Err(error) => ScanItem {
            path: path_string,
            name,
            main_lang: None,
            main_lang_color: None,
            lang_group: None,
            ide,
            detected_kind,
            error: Some(error),
            signature: None,
        },
        Ok(state) => match analyzer::analyze_folder(&path) {
            Ok(analysis) => {
                let mut entries = analysis.languages.results.into_iter().collect::<Vec<_>>();
                sort_languages(&mut entries);
                let main_lang = entries.first().map(|(name, _)| name.clone());
                let main_lang_color = entries.first().and_then(|(_, stats)| stats.color.clone());
                let lang_group = (!entries.is_empty()).then(|| to_lang_group(&entries));

                ScanItem {
                    path: path_string,
                    name,
                    main_lang,
                    main_lang_color,
                    lang_group,
                    ide,
                    detected_kind,
                    error: None,
                    signature: Some(state.signature),
                }
            }
            Err(error) => ScanItem {
                path: path_string,
                name,
                main_lang: None,
                main_lang_color: None,
                lang_group: None,
                ide,
                detected_kind,
                error: Some(error),
                signature: Some(state.signature),
            },
        },
    }
}

fn collect_root_projects(root: &Path, max_depth: usize) -> Vec<PathBuf> {
    if max_depth == 0 {
        return git::is_git_project(root)
            .then(|| root.to_path_buf())
            .into_iter()
            .collect();
    }

    let mut projects = Vec::new();
    collect_root_projects_at(root, 0, max_depth, &mut projects);
    projects
}

fn collect_root_projects_at(
    dir: &Path,
    depth: usize,
    max_depth: usize,
    projects: &mut Vec<PathBuf>,
) {
    if depth >= max_depth {
        return;
    }

    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        if git::is_git_project(&path) {
            projects.push(path);
            continue;
        }

        collect_root_projects_at(&path, depth + 1, max_depth, projects);
    }
}

struct DirectoryState {
    total_bytes: u64,
    signature: String,
}

fn directory_state_capped(root: &Path, cap: u64) -> Result<DirectoryState, String> {
    let mut total: u64 = 0;
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    let walker = WalkBuilder::new(root)
        .hidden(true)
        .ignore(true)
        .git_ignore(true)
        .parents(true)
        .filter_entry(|entry| !analyzer::is_skipped_dir(entry))
        .build();

    for entry in walker {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        if !entry
            .file_type()
            .map(|file_type| file_type.is_file())
            .unwrap_or(false)
        {
            continue;
        }
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        let relative = entry.path().strip_prefix(root).unwrap_or(entry.path());
        relative.to_string_lossy().hash(&mut hasher);
        let len = metadata.len();
        len.hash(&mut hasher);
        if let Ok(modified) = metadata.modified() {
            if let Ok(duration) = modified.duration_since(UNIX_EPOCH) {
                duration.as_secs().hash(&mut hasher);
                duration.subsec_nanos().hash(&mut hasher);
            }
        }
        total = total.saturating_add(len);
        if total > cap {
            return Ok(DirectoryState {
                total_bytes: total,
                signature: format!("{:016x}", hasher.finish()),
            });
        }
    }
    Ok(DirectoryState {
        total_bytes: total,
        signature: format!("{:016x}", hasher.finish()),
    })
}

fn sort_languages(entries: &mut [(String, LanguageStats)]) {
    entries.sort_by(|(name_a, stats_a), (name_b, stats_b)| {
        type_priority(stats_a.language_type)
            .cmp(&type_priority(stats_b.language_type))
            .then_with(|| stats_b.bytes.cmp(&stats_a.bytes))
            .then_with(|| name_a.cmp(name_b))
    });
}

fn type_priority(language_type: LanguageType) -> u8 {
    match language_type {
        LanguageType::Programming => 1,
        LanguageType::Markup => 2,
        LanguageType::Data => 3,
        LanguageType::Prose => 4,
    }
}

fn to_lang_group(entries: &[(String, LanguageStats)]) -> Vec<LangGroupItem> {
    let total_bytes = entries
        .iter()
        .map(|(_, stats)| stats.bytes)
        .sum::<u64>()
        .max(1) as f64;
    let mut big = Vec::new();
    let mut other_percentage = 0.0;

    for (name, stats) in entries {
        let percentage = round2((stats.bytes as f64 / total_bytes) * 100.0);
        if percentage < 0.5 {
            other_percentage += percentage;
        } else {
            big.push(LangGroupItem {
                text: name.clone(),
                color: stats.color.clone().unwrap_or_else(|| "#cccccc".to_string()),
                percentage,
            });
        }
    }

    if other_percentage > 0.0 {
        big.push(LangGroupItem {
            text: "Other".to_string(),
            color: "#cccccc".to_string(),
            percentage: round2(other_percentage),
        });
    }

    big
}

fn round2(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

#[cfg(test)]
mod tests {
    use std::{
        fs,
        path::{Path, PathBuf},
        time::{SystemTime, UNIX_EPOCH},
    };

    use super::*;

    struct TempRoot {
        path: PathBuf,
    }

    impl TempRoot {
        fn new(name: &str) -> Self {
            let id = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("time should be valid")
                .as_nanos();
            let path = std::env::temp_dir().join(format!("codenest-scan-{name}-{id}"));
            fs::create_dir_all(&path).expect("temp root should be created");
            Self { path }
        }

        fn dir(&self, relative: &str) -> PathBuf {
            let path = self.path.join(relative);
            fs::create_dir_all(&path).expect("dir should be created");
            path
        }
    }

    impl Drop for TempRoot {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    fn init_git(path: &Path) {
        fs::create_dir_all(path.join(".git")).expect("git dir should be created");
    }

    fn project_names(projects: Vec<PathBuf>) -> Vec<String> {
        let mut names = projects
            .into_iter()
            .filter_map(|path| {
                path.file_name()
                    .map(|name| name.to_string_lossy().into_owned())
            })
            .collect::<Vec<_>>();
        names.sort();
        names
    }

    #[test]
    fn depth_zero_checks_root_itself() {
        let root = TempRoot::new("depth-zero");
        init_git(&root.path);
        init_git(&root.dir("child"));

        let projects = collect_root_projects(&root.path, 0);

        assert_eq!(projects, vec![root.path.clone()]);
    }

    #[test]
    fn depth_one_matches_current_immediate_child_behavior() {
        let root = TempRoot::new("depth-one");
        init_git(&root.dir("child"));
        init_git(&root.dir("nested/grandchild"));

        let projects = collect_root_projects(&root.path, 1);

        assert_eq!(project_names(projects), vec!["child"]);
    }

    #[test]
    fn deeper_scan_finds_nested_git_projects() {
        let root = TempRoot::new("depth-two");
        init_git(&root.dir("nested/grandchild"));

        let projects = collect_root_projects(&root.path, 2);

        assert_eq!(project_names(projects), vec!["grandchild"]);
    }
}
