use std::{
    collections::BTreeMap,
    env,
    fs::File,
    io::Read,
    path::{Path, PathBuf},
};

use ignore::{DirEntry, WalkBuilder};
use serde::Serialize;

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

#[derive(Clone, Copy, Eq, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum LanguageType {
    Data,
    Markup,
    Programming,
    Prose,
}

#[derive(Clone, Copy)]
struct LanguageDef {
    name: &'static str,
    language_type: LanguageType,
    color: Option<&'static str>,
}

#[derive(Clone, Default, Serialize)]
pub struct LineCounts {
    pub total: u64,
    pub content: u64,
    pub code: u64,
}

impl LineCounts {
    fn add(&mut self, other: &LineCounts) {
        self.total += other.total;
        self.content += other.content;
        self.code += other.code;
    }
}

#[derive(Clone, Serialize)]
pub struct LanguageStats {
    pub bytes: u64,
    pub lines: LineCounts,
    #[serde(rename = "type")]
    pub language_type: LanguageType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
}

#[derive(Default, Serialize)]
pub struct FilesResult {
    pub count: u64,
    pub bytes: u64,
    pub lines: LineCounts,
    pub results: BTreeMap<String, Option<String>>,
    pub alternatives: BTreeMap<String, Vec<Option<String>>>,
}

#[derive(Default, Serialize)]
pub struct LanguagesResult {
    pub count: u64,
    pub bytes: u64,
    pub lines: LineCounts,
    pub results: BTreeMap<String, LanguageStats>,
}

#[derive(Default, Serialize)]
pub struct UnknownResult {
    pub count: u64,
    pub bytes: u64,
    pub lines: LineCounts,
    pub extensions: BTreeMap<String, u64>,
    pub filenames: BTreeMap<String, u64>,
}

#[derive(Default, Serialize)]
pub struct LinguistResult {
    pub files: FilesResult,
    pub languages: LanguagesResult,
    pub unknown: UnknownResult,
}

pub fn analyze_folder(folder_path: &Path) -> Result<LinguistResult, String> {
    if !folder_path.is_dir() {
        return Err("Provided path is not a directory".to_string());
    }

    let byte_budget = max_scan_bytes();
    let mut result = LinguistResult::default();
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

fn language_for_path(path: &Path) -> Option<LanguageDef> {
    let file_name = path.file_name()?.to_string_lossy().to_ascii_lowercase();
    match file_name.as_str() {
        "dockerfile" => return Some(lang("Dockerfile", LanguageType::Programming, "#384d54")),
        "makefile" | "gnumakefile" => {
            return Some(lang("Makefile", LanguageType::Programming, "#427819"))
        }
        "cmakelists.txt" => return Some(lang("CMake", LanguageType::Programming, "#DA3434")),
        "cargo.lock" => return Some(lang("TOML", LanguageType::Data, "#9c4221")),
        "package-lock.json" | "pnpm-lock.yaml" | "yarn.lock" => {
            return Some(lang("Lockfile", LanguageType::Data, "#cccccc"));
        }
        _ => {}
    }

    let extension = path.extension()?.to_string_lossy().to_ascii_lowercase();
    match extension.as_str() {
        "rs" => Some(lang("Rust", LanguageType::Programming, "#dea584")),
        "ts" | "tsx" => Some(lang("TypeScript", LanguageType::Programming, "#3178c6")),
        "js" | "jsx" | "mjs" | "cjs" => {
            Some(lang("JavaScript", LanguageType::Programming, "#f1e05a"))
        }
        "vue" => Some(lang("Vue", LanguageType::Programming, "#41b883")),
        "py" | "pyw" => Some(lang("Python", LanguageType::Programming, "#3572A5")),
        "java" => Some(lang("Java", LanguageType::Programming, "#b07219")),
        "kt" | "kts" => Some(lang("Kotlin", LanguageType::Programming, "#A97BFF")),
        "go" => Some(lang("Go", LanguageType::Programming, "#00ADD8")),
        "php" => Some(lang("PHP", LanguageType::Programming, "#4F5D95")),
        "rb" => Some(lang("Ruby", LanguageType::Programming, "#701516")),
        "c" => Some(lang("C", LanguageType::Programming, "#555555")),
        "cc" | "cpp" | "cxx" | "hpp" | "hh" | "hxx" => {
            Some(lang("C++", LanguageType::Programming, "#f34b7d"))
        }
        "h" => Some(lang("C", LanguageType::Programming, "#555555")),
        "cs" => Some(lang("C#", LanguageType::Programming, "#178600")),
        "fs" | "fsx" => Some(lang("F#", LanguageType::Programming, "#b845fc")),
        "swift" => Some(lang("Swift", LanguageType::Programming, "#F05138")),
        "dart" => Some(lang("Dart", LanguageType::Programming, "#00B4AB")),
        "sh" | "bash" | "zsh" | "fish" => Some(lang("Shell", LanguageType::Programming, "#89e051")),
        "ps1" | "psm1" | "psd1" => Some(lang("PowerShell", LanguageType::Programming, "#012456")),
        "sql" => Some(lang("SQL", LanguageType::Programming, "#e38c00")),
        "r" => Some(lang("R", LanguageType::Programming, "#198CE7")),
        "lua" => Some(lang("Lua", LanguageType::Programming, "#000080")),
        "html" | "htm" => Some(lang("HTML", LanguageType::Markup, "#e34c26")),
        "xml" | "xaml" | "csproj" | "vbproj" | "fsproj" => {
            Some(lang("XML", LanguageType::Markup, "#0060ac"))
        }
        "svg" => Some(lang("SVG", LanguageType::Markup, "#ff9900")),
        "md" | "markdown" | "mdx" => Some(lang("Markdown", LanguageType::Prose, "#083fa1")),
        "css" => Some(lang("CSS", LanguageType::Markup, "#563d7c")),
        "scss" => Some(lang("SCSS", LanguageType::Markup, "#c6538c")),
        "sass" => Some(lang("Sass", LanguageType::Markup, "#a53b70")),
        "less" => Some(lang("Less", LanguageType::Markup, "#1d365d")),
        "json" | "json5" => Some(lang("JSON", LanguageType::Data, "#292929")),
        "yaml" | "yml" => Some(lang("YAML", LanguageType::Data, "#cb171e")),
        "toml" => Some(lang("TOML", LanguageType::Data, "#9c4221")),
        "ini" | "env" | "properties" => Some(lang("INI", LanguageType::Data, "#d1dbe0")),
        "gradle" => Some(lang("Gradle", LanguageType::Programming, "#02303a")),
        "groovy" => Some(lang("Groovy", LanguageType::Programming, "#4298b8")),
        "scala" => Some(lang("Scala", LanguageType::Programming, "#c22d40")),
        "svelte" => Some(lang("Svelte", LanguageType::Programming, "#ff3e00")),
        "astro" => Some(lang("Astro", LanguageType::Programming, "#ff5d01")),
        "pug" => Some(lang("Pug", LanguageType::Markup, "#a86454")),
        "handlebars" | "hbs" => Some(lang("Handlebars", LanguageType::Markup, "#f7931e")),
        "graphql" | "gql" => Some(lang("GraphQL", LanguageType::Data, "#e10098")),
        "csv" | "tsv" => Some(lang("CSV", LanguageType::Data, "#237346")),
        _ => None,
    }
}

fn lang(name: &'static str, language_type: LanguageType, color: &'static str) -> LanguageDef {
    LanguageDef {
        name,
        language_type,
        color: Some(color),
    }
}

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
    use std::{fs, sync::Mutex};

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
}
