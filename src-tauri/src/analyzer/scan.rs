use std::{env, fs::File, io::Read, path::Path};

use ignore::{DirEntry, WalkBuilder};

use super::{
    language::language_for_path,
    models::{LanguageStats, LanguageType, LineCounts, LinguistResult},
    overrides::detect_linguist_language_override,
};

const MAX_LINE_COUNT_BYTES: u64 = 1_500_000;
const DEFAULT_MAX_SCAN_BYTES: u64 = 800 * 1024 * 1024;
const MAX_ALLOWED_SCAN_BYTES: u64 = 10 * 1024 * 1024 * 1024; // 10GB 上限

/// 单次语言分析/扫描允许处理的最大累计字节数。
/// 可通过 `CODENEST_MAX_SCAN_BYTES` 环境变量调整(钳制在 10GB 内)。
pub fn max_scan_bytes() -> u64 {
    env::var("CODENEST_MAX_SCAN_BYTES")
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .map(|value| value.min(MAX_ALLOWED_SCAN_BYTES))
        .unwrap_or(DEFAULT_MAX_SCAN_BYTES)
}

pub fn analyze_folder(folder_path: &Path) -> Result<LinguistResult, String> {
    if !folder_path.is_dir() {
        return Err("Provided path is not a directory".to_string());
    }

    let byte_budget = max_scan_bytes();
    let mut result = LinguistResult {
        main_language_override: detect_linguist_language_override(folder_path),
        ..LinguistResult::default()
    };
    let walker = WalkBuilder::new(folder_path)
        .hidden(true)
        .ignore(true)
        .git_ignore(true)
        .parents(true)
        .filter_entry(|entry| !is_skipped_dir(entry))
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

        let path = entry.path();
        if is_skipped_file(path) {
            continue;
        }

        let metadata = match entry.metadata() {
            Ok(metadata) => metadata,
            Err(_) => continue,
        };
        let bytes = metadata.len();

        // 累计体积熔断:超出预算时终止分析,避免对超大目录
        // (如误选磁盘根目录)做无界的 IO 和行数统计。
        if result.files.bytes.saturating_add(bytes) > byte_budget {
            return Err(format!(
                "Directory too large to analyze (over {} MB)",
                byte_budget / (1024 * 1024)
            ));
        }
        let language = language_for_path(path);
        let lines = language
            .filter(|language| should_count_lines(language.language_type, bytes))
            .and_then(|_| count_lines(path))
            .unwrap_or_default();
        let relative_path = relative_path(folder_path, path);

        result.files.count += 1;
        result.files.bytes += bytes;
        result.files.lines.add(&lines);

        if let Some(language) = language {
            result
                .files
                .results
                .insert(relative_path.clone(), Some(language.name.to_string()));
            result.files.alternatives.insert(relative_path, Vec::new());

            let entry = result
                .languages
                .results
                .entry(language.name.to_string())
                .or_insert(LanguageStats {
                    bytes: 0,
                    lines: LineCounts::default(),
                    language_type: language.language_type,
                    parent: None,
                    color: language.color.map(ToOwned::to_owned),
                });
            entry.bytes += bytes;
            entry.lines.add(&lines);
        } else {
            result.files.results.insert(relative_path.clone(), None);
            result.files.alternatives.insert(relative_path, Vec::new());
            result.unknown.count += 1;
            result.unknown.bytes += bytes;
            result.unknown.lines.add(&lines);

            if let Some(extension) = path.extension().and_then(|ext| ext.to_str()) {
                *result
                    .unknown
                    .extensions
                    .entry(extension.to_ascii_lowercase())
                    .or_default() += 1;
            } else if let Some(file_name) = path.file_name().and_then(|name| name.to_str()) {
                *result
                    .unknown
                    .filenames
                    .entry(file_name.to_ascii_lowercase())
                    .or_default() += 1;
            }
        }
    }

    result.languages.count = result.languages.results.len() as u64;
    result.languages.bytes = result
        .languages
        .results
        .values()
        .map(|lang| lang.bytes)
        .sum();
    for language in result.languages.results.values() {
        result.languages.lines.add(&language.lines);
    }

    Ok(result)
}

pub fn is_skipped_dir(entry: &DirEntry) -> bool {
    if entry.depth() == 0 {
        return false;
    }
    let Some(file_type) = entry.file_type() else {
        return false;
    };
    if !file_type.is_dir() {
        return false;
    }
    let name = entry.file_name().to_string_lossy().to_ascii_lowercase();
    matches!(
        name.as_str(),
        ".git"
            | ".hg"
            | ".svn"
            | ".idea"
            | ".vscode"
            | ".cache"
            | ".gradle"
            | ".parcel-cache"
            | ".pytest_cache"
            | ".mypy_cache"
            | ".ruff_cache"
            | "node_modules"
            | "vendor"
            | "dist"
            | "build"
            | "out"
            | "release"
            | "debug"
            | "coverage"
            | "target"
            | "__pycache__"
            | "venv"
            | ".venv"
            | ".next"
            | ".nuxt"
            | ".svelte-kit"
            | ".turbo"
    )
}

fn is_skipped_file(path: &Path) -> bool {
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .map(str::to_ascii_lowercase)
        .unwrap_or_default();

    if file_name.ends_with(".min.js")
        || file_name.ends_with(".min.css")
        || file_name.ends_with(".bundle.js")
        || file_name.ends_with(".bundle.css")
    {
        return true;
    }

    let extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .map(str::to_ascii_lowercase)
        .unwrap_or_default();

    matches!(
        extension.as_str(),
        "map"
            | "png"
            | "jpg"
            | "jpeg"
            | "gif"
            | "webp"
            | "avif"
            | "bmp"
            | "ico"
            | "icns"
            | "mp4"
            | "mov"
            | "webm"
            | "mkv"
            | "mp3"
            | "wav"
            | "flac"
            | "ogg"
            | "pdf"
            | "zip"
            | "rar"
            | "7z"
            | "gz"
            | "tgz"
            | "tar"
            | "woff"
            | "woff2"
            | "ttf"
            | "otf"
            | "eot"
            | "wasm"
            | "exe"
            | "dll"
            | "so"
            | "dylib"
            | "class"
            | "jar"
    )
}

fn should_count_lines(language_type: LanguageType, bytes: u64) -> bool {
    bytes <= MAX_LINE_COUNT_BYTES
        && matches!(
            language_type,
            LanguageType::Programming | LanguageType::Markup | LanguageType::Prose
        )
}

fn count_lines(path: &Path) -> Option<LineCounts> {
    let mut file = File::open(path).ok()?;
    let mut buffer = [0_u8; 16 * 1024];
    let mut total = 0_u64;
    let mut content = 0_u64;
    let mut has_bytes = false;
    let mut line_has_content = false;
    let mut last_byte = None;

    loop {
        let read = file.read(&mut buffer).ok()?;
        if read == 0 {
            break;
        }

        for byte in &buffer[..read] {
            if *byte == 0 {
                return None;
            }

            has_bytes = true;
            last_byte = Some(*byte);

            if *byte == b'\n' {
                total += 1;
                if line_has_content {
                    content += 1;
                }
                line_has_content = false;
            } else if *byte != b'\r' && !byte.is_ascii_whitespace() {
                line_has_content = true;
            }
        }
    }

    if has_bytes && last_byte != Some(b'\n') {
        total += 1;
        if line_has_content {
            content += 1;
        }
    }

    Some(LineCounts {
        total,
        content,
        code: content,
    })
}

fn relative_path(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

#[cfg(test)]
mod tests {
    use std::{fs, sync::Mutex};

    use super::super::language::language_color;
    use super::analyze_folder;

    /// 串行化涉及 `CODENEST_MAX_SCAN_BYTES` 环境变量的测试,避免并行干扰。
    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn analyze_folder_rejects_directories_over_byte_budget() {
        let _guard = ENV_LOCK.lock().unwrap();
        let dir = std::env::temp_dir().join("codenest-analyzer-budget-test");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("main.rs"), "fn main() {}\n".repeat(10)).unwrap();

        // 预算缩到 1 字节,任何文件都会触发熔断
        std::env::set_var("CODENEST_MAX_SCAN_BYTES", "1");
        let result = analyze_folder(&dir);
        std::env::remove_var("CODENEST_MAX_SCAN_BYTES");

        let _ = fs::remove_dir_all(&dir);
        match result {
            Err(error) => assert!(error.contains("too large"), "unexpected error: {error}"),
            Ok(_) => panic!("oversized directory should be rejected"),
        }
    }

    #[test]
    fn analyze_folder_succeeds_within_budget() {
        let _guard = ENV_LOCK.lock().unwrap();
        let dir = std::env::temp_dir().join("codenest-analyzer-ok-test");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("main.rs"), "fn main() {}\n").unwrap();

        let result = analyze_folder(&dir);

        let _ = fs::remove_dir_all(&dir);
        let result = result.expect("small directory should analyze fine");
        assert!(result.languages.results.contains_key("Rust"));
    }

    #[test]
    fn analyze_folder_reports_linguist_language_override() {
        let _guard = ENV_LOCK.lock().unwrap();
        let dir = std::env::temp_dir().join("codenest-analyzer-linguist-override-test");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("source.foo"), "custom language\n").unwrap();
        fs::write(dir.join(".gitattributes"), "*.foo linguist-language=Rust\n").unwrap();

        let result = analyze_folder(&dir);

        let _ = fs::remove_dir_all(&dir);
        let result = result.expect("directory should analyze fine");
        assert!(result.languages.results.is_empty());
        assert_eq!(result.main_language_override.as_deref(), Some("Rust"));
        assert_eq!(language_color("Rust"), Some("#dea584"));
    }
}
