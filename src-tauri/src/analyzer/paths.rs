use std::path::{Path, PathBuf};

pub fn normalize_path_key(path: &Path) -> String {
    let normalized = display_path(&canonical_or_original(path))
        .replace('\\', "/")
        .trim_end_matches('/')
        .to_string();
    if cfg!(windows) {
        normalized.to_ascii_lowercase()
    } else {
        normalized
    }
}

pub fn canonical_or_original(path: &Path) -> PathBuf {
    path.canonicalize().unwrap_or_else(|_| path.to_path_buf())
}

pub fn display_path(path: &Path) -> String {
    strip_windows_verbatim_prefix(&path.to_string_lossy())
}

pub fn strip_windows_verbatim_prefix(path: &str) -> String {
    if let Some(rest) = path.strip_prefix(r"\\?\UNC\") {
        return format!(r"\\{rest}");
    }
    if let Some(rest) = path.strip_prefix(r"\\?\") {
        return rest.to_string();
    }
    path.to_string()
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{
        canonical_or_original, display_path, normalize_path_key, strip_windows_verbatim_prefix,
    };

    #[test]
    fn strip_windows_verbatim_prefix_removes_drive_and_unc_prefixes() {
        assert_eq!(
            strip_windows_verbatim_prefix(r"\\?\E:\Projects\CodeNest"),
            r"E:\Projects\CodeNest"
        );
        assert_eq!(
            strip_windows_verbatim_prefix(r"\\?\UNC\server\share\CodeNest"),
            r"\\server\share\CodeNest"
        );
        assert_eq!(
            strip_windows_verbatim_prefix(r"E:\Projects\CodeNest"),
            r"E:\Projects\CodeNest"
        );
    }

    #[test]
    fn normalize_path_key_unifies_slashes_and_trims_trailing_separators() {
        let key = normalize_path_key(Path::new(r"E:\Projects\CodeNest\"));
        assert!(!key.ends_with('/'));
        assert!(key.contains("Projects") || key.contains("projects"));
        assert!(key.contains('/'));
        assert!(!key.contains('\\'));
    }

    #[test]
    #[cfg(windows)]
    fn normalize_path_key_lowercases_on_windows() {
        let key = normalize_path_key(Path::new(r"E:\Projects\CodeNest"));
        assert_eq!(key, key.to_ascii_lowercase());
    }

    #[test]
    fn display_path_strips_verbatim_prefix() {
        assert_eq!(
            display_path(Path::new(r"\\?\E:\Projects\CodeNest")),
            r"E:\Projects\CodeNest"
        );
    }

    #[test]
    fn canonical_or_original_keeps_missing_paths() {
        let missing = Path::new(r"E:\definitely-missing-codenest-path-xyz");
        assert_eq!(canonical_or_original(missing), missing.to_path_buf());
    }
}
