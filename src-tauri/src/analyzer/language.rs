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
