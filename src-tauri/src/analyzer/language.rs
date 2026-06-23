use std::path::Path;

use super::models::LanguageType;

#[derive(Clone, Copy)]
pub(super) struct LanguageDef {
    pub(super) name: &'static str,
    pub(super) language_type: LanguageType,
    pub(super) color: Option<&'static str>,
}

pub(super) fn language_for_path(path: &Path) -> Option<LanguageDef> {
    let file_name = path.file_name()?.to_string_lossy().to_ascii_lowercase();
    match file_name.as_str() {
        "dockerfile" => return Some(lang("Dockerfile", LanguageType::Programming)),
        "makefile" | "gnumakefile" => return Some(lang("Makefile", LanguageType::Programming)),
        "cmakelists.txt" => return Some(lang("CMake", LanguageType::Programming)),
        "cargo.lock" => return Some(lang("TOML", LanguageType::Data)),
        "package-lock.json" | "pnpm-lock.yaml" | "yarn.lock" => {
            return Some(lang("Lockfile", LanguageType::Data));
        }
        _ => {}
    }

    let extension = path.extension()?.to_string_lossy().to_ascii_lowercase();
    match extension.as_str() {
        "rs" => Some(lang("Rust", LanguageType::Programming)),
        "ts" | "tsx" => Some(lang("TypeScript", LanguageType::Programming)),
        "js" | "jsx" | "mjs" | "cjs" => Some(lang("JavaScript", LanguageType::Programming)),
        "vue" => Some(lang("Vue", LanguageType::Programming)),
        "py" | "pyw" => Some(lang("Python", LanguageType::Programming)),
        "java" => Some(lang("Java", LanguageType::Programming)),
        "kt" | "kts" => Some(lang("Kotlin", LanguageType::Programming)),
        "go" => Some(lang("Go", LanguageType::Programming)),
        "php" => Some(lang("PHP", LanguageType::Programming)),
        "rb" => Some(lang("Ruby", LanguageType::Programming)),
        "c" => Some(lang("C", LanguageType::Programming)),
        "cc" | "cpp" | "cxx" | "hpp" | "hh" | "hxx" => Some(lang("C++", LanguageType::Programming)),
        "h" => Some(lang("C", LanguageType::Programming)),
        "cs" => Some(lang("C#", LanguageType::Programming)),
        "fs" | "fsx" => Some(lang("F#", LanguageType::Programming)),
        "swift" => Some(lang("Swift", LanguageType::Programming)),
        "dart" => Some(lang("Dart", LanguageType::Programming)),
        "sh" | "bash" | "zsh" | "fish" => Some(lang("Shell", LanguageType::Programming)),
        "ps1" | "psm1" | "psd1" => Some(lang("PowerShell", LanguageType::Programming)),
        "sql" => Some(lang("SQL", LanguageType::Programming)),
        "r" => Some(lang("R", LanguageType::Programming)),
        "lua" => Some(lang("Lua", LanguageType::Programming)),
        "html" | "htm" => Some(lang("HTML", LanguageType::Markup)),
        "xml" | "xaml" | "csproj" | "vbproj" | "fsproj" => Some(lang("XML", LanguageType::Markup)),
        "svg" => Some(lang("SVG", LanguageType::Markup)),
        "md" | "markdown" | "mdx" => Some(lang("Markdown", LanguageType::Prose)),
        "css" => Some(lang("CSS", LanguageType::Markup)),
        "scss" => Some(lang("SCSS", LanguageType::Markup)),
        "sass" => Some(lang("Sass", LanguageType::Markup)),
        "less" => Some(lang("Less", LanguageType::Markup)),
        "json" | "json5" => Some(lang("JSON", LanguageType::Data)),
        "yaml" | "yml" => Some(lang("YAML", LanguageType::Data)),
        "toml" => Some(lang("TOML", LanguageType::Data)),
        "ini" | "env" | "properties" => Some(lang("INI", LanguageType::Data)),
        "gradle" => Some(lang("Gradle", LanguageType::Programming)),
        "groovy" => Some(lang("Groovy", LanguageType::Programming)),
        "scala" => Some(lang("Scala", LanguageType::Programming)),
        "svelte" => Some(lang("Svelte", LanguageType::Programming)),
        "astro" => Some(lang("Astro", LanguageType::Programming)),
        "pug" => Some(lang("Pug", LanguageType::Markup)),
        "handlebars" | "hbs" => Some(lang("Handlebars", LanguageType::Markup)),
        "graphql" | "gql" => Some(lang("GraphQL", LanguageType::Data)),
        "csv" | "tsv" => Some(lang("CSV", LanguageType::Data)),
        _ => None,
    }
}

pub(crate) fn language_color(language_name: &str) -> Option<&'static str> {
    match language_name {
        "Astro" => Some("#ff5d01"),
        "C" => Some("#555555"),
        "C#" => Some("#178600"),
        "C++" => Some("#f34b7d"),
        "CMake" => Some("#DA3434"),
        "CSV" => Some("#237346"),
        "CSS" => Some("#563d7c"),
        "Dart" => Some("#00B4AB"),
        "Dockerfile" => Some("#384d54"),
        "F#" => Some("#b845fc"),
        "Go" => Some("#00ADD8"),
        "Gradle" => Some("#02303a"),
        "GraphQL" => Some("#e10098"),
        "Groovy" => Some("#4298b8"),
        "Handlebars" => Some("#f7931e"),
        "HTML" => Some("#e34c26"),
        "INI" => Some("#d1dbe0"),
        "Java" => Some("#b07219"),
        "JavaScript" => Some("#f1e05a"),
        "JSON" => Some("#292929"),
        "Kotlin" => Some("#A97BFF"),
        "Less" => Some("#1d365d"),
        "Lockfile" => Some("#cccccc"),
        "Lua" => Some("#000080"),
        "Makefile" => Some("#427819"),
        "Markdown" => Some("#083fa1"),
        "PHP" => Some("#4F5D95"),
        "PowerShell" => Some("#012456"),
        "Pug" => Some("#a86454"),
        "Python" => Some("#3572A5"),
        "R" => Some("#198CE7"),
        "Ruby" => Some("#701516"),
        "Rust" => Some("#dea584"),
        "SCSS" => Some("#c6538c"),
        "SQL" => Some("#e38c00"),
        "SVG" => Some("#ff9900"),
        "Sass" => Some("#a53b70"),
        "Scala" => Some("#c22d40"),
        "Shell" => Some("#89e051"),
        "Svelte" => Some("#ff3e00"),
        "Swift" => Some("#F05138"),
        "TOML" => Some("#9c4221"),
        "TypeScript" => Some("#3178c6"),
        "Vue" => Some("#41b883"),
        "XML" => Some("#0060ac"),
        "YAML" => Some("#cb171e"),
        _ => None,
    }
}

fn lang(name: &'static str, language_type: LanguageType) -> LanguageDef {
    LanguageDef {
        name,
        language_type,
        color: language_color(name),
    }
}
