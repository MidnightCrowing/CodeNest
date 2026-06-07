use std::{
    collections::{HashMap, HashSet},
    env, fs,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    time::UNIX_EPOCH,
};

use ignore::WalkBuilder;
use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::{
    analyzer::{self, LanguageStats, LanguageType},
    recent::{collect_from_jetbrains, collect_from_vscode, RecentProject},
};

const DEFAULT_MAX_SCAN_BYTES: u64 = 800 * 1024 * 1024;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanPayload {
    roots_enabled: bool,
    roots: Vec<String>,
    ide_enabled: bool,
    jetbrains: JetbrainsScannerConfig,
    vscode: VscodeScannerConfig,
    existing_paths: Vec<String>,
    #[serde(default)]
    cache_entries: Vec<ScanCacheEntry>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct JetbrainsScannerConfig {
    enabled: bool,
    config_root_path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VscodeScannerConfig {
    enabled: bool,
    state_db_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    items: Vec<ScanItem>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanItem {
    path: String,
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    main_lang: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    main_lang_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    lang_group: Option<Vec<LangGroupItem>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    ide: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    signature: Option<String>,
}

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScanCacheEntry {
    path: String,
    signature: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    main_lang: Option<String>,
    #[serde(default)]
    main_lang_color: Option<String>,
    #[serde(default)]
    lang_group: Option<Vec<LangGroupItem>>,
    #[serde(default)]
    error: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct LangGroupItem {
    text: String,
    color: String,
    percentage: f64,
}

#[tauri::command]
pub async fn scan_projects(payload: ScanPayload) -> Result<ScanResult, String> {
    tauri::async_runtime::spawn_blocking(move || scan_projects_inner(payload))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn detect_jetbrains_config_root_path(app: tauri::AppHandle) -> Option<String> {
    let mut candidates = Vec::new();
    if cfg!(windows) {
        if let Ok(app_data) = app.path().app_data_dir() {
            let roaming = app_data
                .parent()
                .and_then(Path::parent)
                .map(|path| path.join("JetBrains"));
            if let Some(path) = roaming {
                candidates.push(path);
            }
        }
        if let Some(data_dir) = dirs::data_dir() {
            candidates.push(data_dir.join("JetBrains"));
        }
    } else if cfg!(target_os = "macos") {
        if let Some(home) = dirs::home_dir() {
            candidates.push(
                home.join("Library")
                    .join("Application Support")
                    .join("JetBrains"),
            );
        }
    } else if let Some(home) = dirs::home_dir() {
        candidates.push(home.join(".config").join("JetBrains"));
        candidates.push(home.join(".JetBrains"));
    }

    candidates
        .into_iter()
        .find(|path| path.is_dir())
        .map(|path| path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn detect_vscode_state_db_path() -> Option<String> {
    let path = if cfg!(windows) {
        dirs::data_dir()?
            .join("Code")
            .join("User")
            .join("globalStorage")
            .join("state.vscdb")
    } else if cfg!(target_os = "macos") {
        dirs::home_dir()?
            .join("Library")
            .join("Application Support")
            .join("Code")
            .join("User")
            .join("globalStorage")
            .join("state.vscdb")
    } else {
        dirs::home_dir()?
            .join(".config")
            .join("Code")
            .join("User")
            .join("globalStorage")
            .join("state.vscdb")
    };

    path.is_file().then(|| path.to_string_lossy().into_owned())
}

fn scan_projects_inner(payload: ScanPayload) -> Result<ScanResult, String> {
    let mut candidates = Vec::new();

    if payload.roots_enabled {
        for root in &payload.roots {
            candidates.extend(
                list_immediate_subdirs(Path::new(root))
                    .into_iter()
                    .map(|path| RecentProject {
                        path: analyzer::display_path(&path),
                        ide: None,
                    }),
            );
        }
    }

    if payload.ide_enabled {
        if payload.jetbrains.enabled {
            candidates.extend(collect_from_jetbrains(Some(
                &payload.jetbrains.config_root_path,
            )));
        }
        if payload.vscode.enabled {
            candidates.extend(
                collect_from_vscode(Some(&payload.vscode.state_db_path))
                    .into_iter()
                    .map(|item| RecentProject {
                        path: item.path,
                        ide: Some("visual-studio-code".to_string()),
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
    let max_scan_bytes = env::var("CODENEST_MAX_SCAN_BYTES")
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(DEFAULT_MAX_SCAN_BYTES);

    let mut seen = HashSet::new();
    let mut items = Vec::new();
    for candidate in candidates {
        let path = PathBuf::from(&candidate.path);
        if !path.is_dir() {
            continue;
        }

        let canonical = analyzer::canonical_or_original(&path);
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
        .unwrap_or_else(|| "Unnamed Project".to_string());
    let path_string = analyzer::display_path(&path);

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
            error: None,
            signature: Some(state.signature),
        },
        Err(error) => ScanItem {
            path: path_string,
            name,
            main_lang: None,
            main_lang_color: None,
            lang_group: None,
            ide,
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
                error: Some(error),
                signature: Some(state.signature),
            },
        },
    }
}

fn list_immediate_subdirs(root: &Path) -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(root) else {
        return Vec::new();
    };
    entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.is_dir())
        .collect()
}

struct DirectoryState {
    total_bytes: u64,
    signature: String,
}

fn directory_state_capped(root: &Path, cap: u64) -> Result<DirectoryState, String> {
    let mut total = 0;
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
        metadata.len().hash(&mut hasher);
        if let Ok(modified) = metadata.modified() {
            if let Ok(duration) = modified.duration_since(UNIX_EPOCH) {
                duration.as_secs().hash(&mut hasher);
                duration.subsec_nanos().hash(&mut hasher);
            }
        }
        total += metadata.len();
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
