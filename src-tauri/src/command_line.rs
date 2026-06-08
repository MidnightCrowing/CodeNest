use std::path::Path;

pub fn parse_command_line(input: &str) -> Result<Vec<String>, String> {
    let mut args = Vec::new();
    let mut current = String::new();
    let mut chars = input.chars().peekable();
    let mut quote: Option<char> = None;

    while let Some(ch) = chars.next() {
        match ch {
            '"' | '\'' if quote.is_none() => quote = Some(ch),
            '"' | '\'' if quote == Some(ch) => quote = None,
            '\\' if matches!(chars.peek(), Some('"' | '\'' | '\\')) => {
                current.push(chars.next().unwrap());
            }
            '\\' => current.push(ch),
            ch if ch.is_whitespace() && quote.is_none() => {
                if !current.is_empty() {
                    args.push(std::mem::take(&mut current));
                }
            }
            _ => current.push(ch),
        }
    }

    if quote.is_some() {
        return Err("Command contains an unterminated quote".to_string());
    }
    if !current.is_empty() {
        args.push(current);
    }

    Ok(args)
}

pub fn shell_join(args: &[String]) -> String {
    args.iter()
        .map(|arg| shell_quote(arg))
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn shell_quote(value: &str) -> String {
    if value
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.' | '/' | '\\' | ':'))
    {
        value.to_string()
    } else {
        format!("'{}'", value.replace('\'', "'\"'\"'"))
    }
}

pub fn quote_command_path(path: &Path) -> String {
    let text = path.to_string_lossy();
    if text.contains(char::is_whitespace) {
        format!("\"{}\"", text.replace('"', "\\\""))
    } else {
        text.into_owned()
    }
}

#[cfg(test)]
mod tests {
    use super::parse_command_line;

    #[test]
    fn parse_command_line_keeps_windows_path_backslashes() {
        let args = parse_command_line(
            r"C:\Users\lenovo\AppData\Local\JetBrains\Toolbox\scripts\idea.cmd {project}",
        )
        .unwrap();

        assert_eq!(
            args,
            vec![
                r"C:\Users\lenovo\AppData\Local\JetBrains\Toolbox\scripts\idea.cmd",
                "{project}"
            ]
        );
    }

    #[test]
    fn parse_command_line_handles_quoted_program_with_spaces() {
        let args = parse_command_line(
            r#""C:\Program Files\Cursor\Cursor.exe" --reuse-window "{project}""#,
        )
        .unwrap();

        assert_eq!(
            args,
            vec![
                r"C:\Program Files\Cursor\Cursor.exe",
                "--reuse-window",
                "{project}"
            ]
        );
    }
}
