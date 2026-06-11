use std::path::Path;

pub fn parse_command_line(input: &str) -> Result<Vec<String>, String> {
    const MAX_COMMAND_LENGTH: usize = 32 * 1024;
    if input.len() > MAX_COMMAND_LENGTH {
        return Err(format!("Command line too long: {} bytes", input.len()));
    }

    let mut args = Vec::new();
    let mut current = String::new();
    let mut chars = input.chars().peekable();
    let mut quote: Option<char> = None;

    while let Some(ch) = chars.next() {
        match ch {
            '"' | '\'' if quote.is_none() => quote = Some(ch),
            '"' | '\'' if quote == Some(ch) => quote = None,
            '\\' if matches!(chars.peek(), Some('"' | '\'' | '\\')) => {
                if let Some(next_ch) = chars.next() {
                    current.push(next_ch);
                }
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

    if args.is_empty() {
        return Err("Command cannot be empty".to_string());
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
    #[cfg(target_os = "windows")]
    {
        cmd_quote(value)
    }
    #[cfg(not(target_os = "windows"))]
    {
        if !value.is_empty()
            && value
                .chars()
                .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.' | '/' | '\\' | ':'))
        {
            value.to_string()
        } else {
            format!("'{}'", value.replace('\'', "'\"'\"'"))
        }
    }
}

/// 为 cmd.exe 上下文引用参数。
///
/// cmd 的双引号内 `& | < > ^` 均为字面量,无需也不能用 `^` 转义
/// (引号内的 `^` 会原样保留)。嵌入的双引号以 `""` 表示。
/// 注意:`%` 在 cmd 命令行中无法可靠转义(引号内仍会展开环境变量),
/// 此处不处理——路径来源于用户本机配置,而非不可信输入。
#[cfg(target_os = "windows")]
fn cmd_quote(value: &str) -> String {
    if !value.is_empty()
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.' | ':' | '\\' | '/'))
    {
        value.to_string()
    } else {
        format!("\"{}\"", value.replace('"', "\"\""))
    }
}

/// 引用探测到的编辑器路径,用于生成命令模板。
///
/// 输出由本模块的 parse_command_line 解析(而非 shell),
/// 因此只需配合其支持的双引号与反斜杠转义规则。
pub fn quote_command_path(path: &Path) -> String {
    let text = path.to_string_lossy();
    if text.contains(char::is_whitespace) || text.contains('"') {
        format!("\"{}\"", text.replace('"', "\\\""))
    } else {
        text.into_owned()
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{parse_command_line, quote_command_path};

    #[test]
    fn quote_command_path_roundtrips_through_parse_command_line() {
        let path = Path::new(r"C:\Program Files\Microsoft VS Code\Code.exe");
        let command = format!("{} {{project}}", quote_command_path(path));
        let args = parse_command_line(&command).unwrap();

        assert_eq!(
            args,
            vec![r"C:\Program Files\Microsoft VS Code\Code.exe", "{project}"]
        );
    }

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
