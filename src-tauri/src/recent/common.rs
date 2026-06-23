use std::{
    collections::HashSet,
    path::{Path, PathBuf},
};

use percent_encoding::percent_decode_str;
use url::Url;

use crate::analyzer::{canonical_or_original, display_path, normalize_path_key};

use super::models::RecentProject;

pub(super) fn modified_millis(path: &Path) -> u128 {
    path.metadata()
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}

pub(super) fn uniq_existing_dirs(items: Vec<RecentProject>) -> Vec<RecentProject> {
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

pub(super) fn file_uri_to_path(uri: &str) -> Option<String> {
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
