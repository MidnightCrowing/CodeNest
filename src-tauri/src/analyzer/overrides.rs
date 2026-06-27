use std::{collections::BTreeSet, fs, path::Path};

struct LanguageOverride {
    pattern: String,
    language: String,
}

pub(crate) fn detect_linguist_language_override(root: &Path) -> Option<String> {
    let contents = fs::read_to_string(root.join(".gitattributes")).ok()?;
    let overrides = parse_linguist_language_overrides(&contents);
    if overrides.is_empty() {
        return None;
    }

    if let Some(project_wide) = overrides
        .iter()
        .rev()
        .find(|item| is_project_wide_pattern(&item.pattern))
    {
        return Some(project_wide.language.clone());
    }

    let languages = overrides
        .iter()
        .map(|item| item.language.as_str())
        .collect::<BTreeSet<_>>();
    if languages.len() == 1 {
        return overrides.last().map(|item| item.language.clone());
    }

    None
}

fn parse_linguist_language_overrides(contents: &str) -> Vec<LanguageOverride> {
    contents
        .lines()
        .filter_map(parse_linguist_language_override)
        .collect()
}

fn parse_linguist_language_override(line: &str) -> Option<LanguageOverride> {
    let line = line.trim();
    if line.is_empty() || line.starts_with('#') {
        return None;
    }

    let tokens = split_gitattributes_line(line);
    let pattern = tokens.first()?.to_string();
    tokens.iter().skip(1).find_map(|token| {
        parse_linguist_language_attr(token).map(|language| LanguageOverride {
            pattern: pattern.clone(),
            language,
        })
    })
}

fn parse_linguist_language_attr(token: &str) -> Option<String> {
    let value = token.strip_prefix("linguist-language=")?.trim();
    (!value.is_empty()).then(|| value.to_string())
}

fn split_gitattributes_line(line: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut current = String::new();
    let mut quote = None;
    let mut escaped = false;

    for char in line.chars() {
        if escaped {
            current.push(char);
            escaped = false;
            continue;
        }

        if char == '\\' {
            escaped = true;
            continue;
        }

        if let Some(quote_char) = quote {
            if char == quote_char {
                quote = None;
            } else {
                current.push(char);
            }
            continue;
        }

        if char == '"' || char == '\'' {
            quote = Some(char);
        } else if char.is_whitespace() {
            if !current.is_empty() {
                tokens.push(std::mem::take(&mut current));
            }
        } else {
            current.push(char);
        }
    }

    if escaped {
        current.push('\\');
    }
    if !current.is_empty() {
        tokens.push(current);
    }

    tokens
}

fn is_project_wide_pattern(pattern: &str) -> bool {
    matches!(pattern.trim_start_matches('/'), "*" | "**" | "**/*" | "*.*")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_single_linguist_language_override() {
        assert_eq!(
            parse_linguist_language_overrides("*.foo linguist-language=Rust")
                .last()
                .map(|item| item.language.as_str()),
            Some("Rust")
        );
    }

    #[test]
    fn supports_quoted_linguist_language_override() {
        assert_eq!(
            parse_linguist_language_overrides(r#"*.foo linguist-language="Common Lisp""#)
                .last()
                .map(|item| item.language.as_str()),
            Some("Common Lisp")
        );
    }

    #[test]
    fn ignores_ambiguous_language_overrides() {
        let dir = std::env::temp_dir().join("codenest-ambiguous-linguist-language");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join(".gitattributes"),
            "*.foo linguist-language=Rust\n*.bar linguist-language=Python\n",
        )
        .unwrap();

        let result = detect_linguist_language_override(&dir);

        let _ = fs::remove_dir_all(&dir);
        assert_eq!(result, None);
    }

    #[test]
    fn prefers_project_wide_language_override() {
        let dir = std::env::temp_dir().join("codenest-wide-linguist-language");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join(".gitattributes"),
            "*.foo linguist-language=Rust\n* linguist-language=TypeScript\n",
        )
        .unwrap();

        let result = detect_linguist_language_override(&dir);

        let _ = fs::remove_dir_all(&dir);
        assert_eq!(result.as_deref(), Some("TypeScript"));
    }
}
