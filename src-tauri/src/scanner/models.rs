use std::collections::HashMap;

use serde::{Deserialize, Serialize};

pub(super) const HISTORY_SCANNER_EDITORS: &[&str] = &[
    "cursor",
    "trae",
    "windsurf",
    "claude-code",
    "codex-cli",
    "gemini-cli",
    "visual-studio-code",
];

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanPayload {
    pub(super) roots_enabled: bool,
    pub(super) roots: Vec<String>,
    #[serde(default = "default_root_scan_depth")]
    pub(super) root_scan_depth: usize,
    pub(super) ide_enabled: bool,
    pub(super) jetbrains: JetbrainsScannerConfig,
    #[serde(default)]
    pub(super) recent_editors: HashMap<String, VscodeScannerConfig>,
    #[serde(default)]
    pub(super) cli_editors: HashMap<String, CliScannerConfig>,
    pub(super) existing_paths: Vec<String>,
    #[serde(default)]
    pub(super) cache_entries: Vec<ScanCacheEntry>,
}

fn default_root_scan_depth() -> usize {
    1
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct JetbrainsScannerConfig {
    pub(super) enabled: bool,
    pub(super) config_root_path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct VscodeScannerConfig {
    pub(super) enabled: bool,
    pub(super) state_db_path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CliScannerConfig {
    pub(super) enabled: bool,
    pub(super) history_root_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub(super) items: Vec<ScanItem>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanItem {
    pub(super) path: String,
    pub(super) name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) main_lang: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) main_lang_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) lang_group: Option<Vec<LangGroupItem>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) ide: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) detected_kind: Option<DetectedProjectKind>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) signature: Option<String>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) enum DetectedProjectKind {
    Mine,
    Fork,
    Clone,
}

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ScanCacheEntry {
    pub(super) path: String,
    pub(super) signature: String,
    #[serde(default)]
    pub(super) name: String,
    #[serde(default)]
    pub(super) main_lang: Option<String>,
    #[serde(default)]
    pub(super) main_lang_color: Option<String>,
    #[serde(default)]
    pub(super) lang_group: Option<Vec<LangGroupItem>>,
    #[serde(default)]
    pub(super) error: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct LangGroupItem {
    pub(super) text: String,
    pub(super) color: String,
    pub(super) percentage: f64,
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    #[test]
    fn parses_recent_editor_scan_payload() {
        let payload: ScanPayload = serde_json::from_value(json!({
            "rootsEnabled": false,
            "roots": [],
            "ideEnabled": true,
            "jetbrains": {
                "enabled": false,
                "configRootPath": ""
            },
            "recentEditors": {
                "cursor": {
                    "enabled": true,
                    "stateDbPath": "cursor.vscdb"
                },
                "visual-studio-code": {
                    "enabled": false,
                    "stateDbPath": ""
                }
            },
            "existingPaths": []
        }))
        .expect("recent editor payload should parse");

        let cursor = payload
            .recent_editors
            .get("cursor")
            .expect("cursor config should exist");
        assert!(cursor.enabled);
        assert_eq!(cursor.state_db_path, "cursor.vscdb");
    }

    #[test]
    fn parses_cli_editor_scan_payload() {
        let payload: ScanPayload = serde_json::from_value(json!({
            "rootsEnabled": false,
            "roots": [],
            "ideEnabled": true,
            "jetbrains": {
                "enabled": false,
                "configRootPath": ""
            },
            "cliEditors": {
                "codex-cli": {
                    "enabled": true,
                    "historyRootPath": ".codex"
                }
            },
            "existingPaths": []
        }))
        .expect("cli editor payload should parse");

        let codex = payload
            .cli_editors
            .get("codex-cli")
            .expect("codex config should exist");
        assert!(codex.enabled);
        assert_eq!(codex.history_root_path, ".codex");
    }

    #[test]
    fn parses_scan_depth() {
        let payload: ScanPayload = serde_json::from_value(json!({
            "rootsEnabled": true,
            "roots": ["projects"],
            "rootScanDepth": 2,
            "ideEnabled": false,
            "jetbrains": {
                "enabled": false,
                "configRootPath": ""
            },
            "existingPaths": []
        }))
        .expect("scanner payload should parse");

        assert_eq!(payload.root_scan_depth, 2);
    }
}
