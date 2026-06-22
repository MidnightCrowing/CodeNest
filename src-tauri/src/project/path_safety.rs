use std::{
    env,
    path::{Path, PathBuf},
    sync::LazyLock,
};

/// 受保护的系统目录根(缓存)
static PROTECTED_SYSTEM_ROOTS: LazyLock<Vec<String>> = LazyLock::new(|| {
    let mut roots = Vec::new();
    if cfg!(windows) {
        for var in [
            "SystemRoot",
            "ProgramFiles",
            "ProgramFiles(x86)",
            "ProgramW6432",
        ] {
            if let Some(value) = env::var_os(var) {
                roots.push(normalize_for_protection_check(Path::new(&value)));
            }
        }
        for fallback in [
            r"C:\Windows",
            r"C:\Program Files",
            r"C:\Program Files (x86)",
        ] {
            roots.push(normalize_for_protection_check(Path::new(fallback)));
        }
    } else {
        for root in [
            "/etc", "/usr", "/bin", "/sbin", "/lib", "/lib64", "/var", "/sys", "/proc", "/boot",
            "/system",
        ] {
            roots.push(root.to_string());
        }
    }
    roots.sort();
    roots.dedup();
    roots
});

/// 去除 Windows canonicalize 产生的 verbatim 前缀(`\\?\` / `\\?\UNC\`)。
fn strip_verbatim_prefix(path: &Path) -> PathBuf {
    let text = path.to_string_lossy();
    if let Some(stripped) = text.strip_prefix(r"\\?\UNC\") {
        PathBuf::from(format!(r"\\{stripped}"))
    } else if let Some(stripped) = text.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        path.to_path_buf()
    }
}

/// 将路径归一化为用于保护检查的形式:去 verbatim 前缀、统一斜杠、
/// 去尾部斜杠,Windows 下转小写。
fn normalize_for_protection_check(path: &Path) -> String {
    let text = strip_verbatim_prefix(path)
        .to_string_lossy()
        .replace('\\', "/");
    let trimmed = text.trim_end_matches('/').to_string();
    if cfg!(windows) {
        trimmed.to_lowercase()
    } else {
        trimmed
    }
}

/// 判断(已 canonicalize 的)路径是否位于受保护的系统目录内。
/// 使用规范化后的路径进行匹配,避免大小写和路径格式差异。
pub(super) fn is_protected_system_path(canonical: &Path) -> bool {
    let normalized = normalize_for_protection_check(canonical);
    let roots = &*PROTECTED_SYSTEM_ROOTS;

    for root in roots {
        // 精确匹配根目录或其子路径
        if normalized == *root || normalized.starts_with(&format!("{root}/")) {
            return true;
        }
    }

    false
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{is_protected_system_path, strip_verbatim_prefix};

    #[test]
    #[cfg(windows)]
    fn strip_verbatim_prefix_removes_windows_prefix() {
        assert_eq!(
            strip_verbatim_prefix(Path::new(r"\\?\C:\Windows")),
            Path::new(r"C:\Windows").to_path_buf()
        );
        assert_eq!(
            strip_verbatim_prefix(Path::new(r"\\?\UNC\server\share")),
            Path::new(r"\\server\share").to_path_buf()
        );
    }

    #[test]
    #[cfg(windows)]
    fn protected_path_check_matches_system_roots() {
        assert!(is_protected_system_path(Path::new(r"\\?\C:\Windows")));
        assert!(is_protected_system_path(Path::new(
            r"\\?\C:\Windows\System32"
        )));
        assert!(is_protected_system_path(Path::new(
            r"C:\Program Files\Some App"
        )));
        assert!(is_protected_system_path(Path::new(
            r"C:\Program Files (x86)\Some App"
        )));
    }

    #[test]
    #[cfg(windows)]
    fn protected_path_check_does_not_overmatch_siblings() {
        assert!(!is_protected_system_path(Path::new(r"C:\Windows-backup")));
        assert!(!is_protected_system_path(Path::new(r"C:\Program Filesx")));
        assert!(!is_protected_system_path(Path::new(r"E:\Projects\demo")));
    }

    #[test]
    #[cfg(not(windows))]
    fn protected_path_check_matches_unix_roots() {
        assert!(is_protected_system_path(Path::new("/etc")));
        assert!(is_protected_system_path(Path::new("/usr/bin")));
        assert!(!is_protected_system_path(Path::new("/home/user/projects")));
        assert!(!is_protected_system_path(Path::new("/etcetera")));
    }
}
