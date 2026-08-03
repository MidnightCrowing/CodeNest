use std::{
    path::{Path, PathBuf},
    process::Command,
};

use crate::command_line::{parse_command_line, shell_join, shell_quote};

pub(super) fn open_project(
    editor_command: &str,
    project: &Path,
    open_in_terminal: bool,
) -> Result<(), String> {
    let has_project_placeholder = editor_command.contains("{project}");
    let mut args = parse_command_line(editor_command)?;

    let project_text = project.to_string_lossy().into_owned();
    for arg in &mut args {
        // 占位符在 parse 后替换：GUI 走 Command::args（不经 shell），终端由 shell_join/shell_quote 转义
        *arg = arg
            .replace("{project}", &project_text)
            .replace("{cwd}", &project_text);
    }

    if !open_in_terminal && !has_project_placeholder {
        args.push(project_text);
    }

    if open_in_terminal {
        return spawn_terminal_command(&args, project);
    }

    let program = PathBuf::from(&args[0]);
    spawn_editor(&program, &args[1..])
}

pub(super) fn open_remote_project(
    host: &str,
    remote_path: &str,
    editor_command: &str,
    mode: &str,
) -> Result<(), String> {
    let host = host.trim();
    let remote_path = remote_path.trim();
    if host.is_empty() || remote_path.is_empty() {
        return Err("Remote host and path cannot be empty".to_string());
    }
    validate_remote_host(host)?;

    match mode {
        "terminal" => spawn_remote_terminal(host, remote_path),
        "vscode" => {
            if editor_command.trim().is_empty() {
                return Err("Editor command cannot be empty".to_string());
            }
            // 只取程序名 token（如 code），丢弃 {project} 等占位符
            let args = parse_command_line(editor_command)?;
            let program = PathBuf::from(&args[0]);
            let remote_args = vec![
                "--remote".to_string(),
                format!("ssh-remote+{host}"),
                remote_path.to_string(),
            ];
            spawn_editor(&program, &remote_args)
        }
        other => Err(format!("Unknown remote open mode: {other}")),
    }
}

fn validate_remote_host(host: &str) -> Result<(), String> {
    if host.chars().all(|ch| {
        ch.is_ascii_alphanumeric() || matches!(ch, '@' | '.' | '_' | '-' | ':' | '[' | ']')
    }) {
        Ok(())
    } else {
        Err("Remote host contains unsupported characters".to_string())
    }
}

fn spawn_editor(program: &Path, args: &[String]) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // CREATE_NO_WINDOW：code.cmd 等批处理默认会弹出控制台窗口
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;

        let extension = program
            .extension()
            .and_then(|extension| extension.to_str())
            .map(str::to_ascii_lowercase);

        if matches!(extension.as_deref(), Some("bat" | "cmd")) {
            // .cmd/.bat 需经 cmd 运行；cmd /C 会剥首尾引号，故整条命令再包一层引号
            let mut line = String::new();
            line.push('"');
            line.push('"');
            line.push_str(&program.to_string_lossy());
            line.push('"');
            for arg in args {
                line.push_str(" \"");
                line.push_str(arg);
                line.push('"');
            }
            line.push('"');

            return Command::new("cmd")
                .raw_arg("/C")
                .raw_arg(&line)
                .creation_flags(CREATE_NO_WINDOW)
                .spawn()
                .map(|_| ())
                .map_err(|error| format!("Failed to launch {}: {error}", program.display()));
        }

        Command::new(program)
            .args(args)
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map(|_| ())
            .map_err(|error| format!("Failed to launch {}: {error}", program.display()))
    }

    #[cfg(not(windows))]
    {
        Command::new(program)
            .args(args)
            .spawn()
            .map(|_| ())
            .map_err(|error| format!("Failed to launch {}: {error}", program.display()))
    }
}

fn spawn_terminal_command(args: &[String], project: &Path) -> Result<(), String> {
    let shell_command = shell_join(args);

    if cfg!(target_os = "macos") {
        // macOS Terminal.app 经 osascript 启动，不继承 current_dir，需把 cd 嵌进命令
        let project_str = project.to_string_lossy();
        let full_command = format!("cd {} ; {}", shell_quote(&project_str), shell_command);
        spawn_terminal_raw(&full_command, None)
    } else {
        spawn_terminal_raw(&shell_command, Some(project))
    }
}

/// 在系统终端窗口中运行 shell 命令。
///
/// `cwd` 只用于 Windows/Linux 的 `current_dir`；macOS 不继承，需自行把 `cd` 嵌进命令。
fn spawn_terminal_raw(shell_command: &str, cwd: Option<&Path>) -> Result<(), String> {
    if cfg!(windows) {
        let mut command = Command::new("cmd");
        if let Some(dir) = cwd {
            command.current_dir(dir);
        }
        command.args(["/C", "start", "", "cmd", "/K", shell_command]);
        suppress_launcher_window(&mut command)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    } else if cfg!(target_os = "macos") {
        // AppleScript 字符串转义 \ 和 "
        let escaped = shell_command.replace('\\', "\\\\").replace('"', "\\\"");
        let script = format!("tell application \"Terminal\" to do script \"{}\"", escaped);

        Command::new("osascript")
            .args(["-e", &script])
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    } else {
        let mut primary = Command::new("x-terminal-emulator");
        if let Some(dir) = cwd {
            primary.current_dir(dir);
        }
        primary
            .args(["-e", "sh", "-lc", shell_command])
            .spawn()
            .or_else(|_| {
                let mut fallback = Command::new("gnome-terminal");
                if let Some(dir) = cwd {
                    fallback.current_dir(dir);
                }
                fallback.args(["--", "sh", "-lc", shell_command]).spawn()
            })
            .map(|_| ())
            .map_err(|error| error.to_string())
    }
}

/// 用 POSIX 单引号包裹远程路径（面向远程 shell，不能用本地 shell_quote）。
fn posix_single_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}

/// 打开终端并通过 ssh 进入远程目录。
fn spawn_remote_terminal(host: &str, remote_path: &str) -> Result<(), String> {
    // cd 后保留交互 shell；$SHELL 远端展开，路径用 POSIX 单引号保护
    let inner = format!("cd {} ; exec $SHELL -l", posix_single_quote(remote_path));

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // raw_arg 精确拼命令行：MSVCRT 的 \" 转义与 cmd 冲突，会把引号带进 host
        // host 无空格可直接传；远端命令整体用双引号包成 ssh 单参数
        let mut command = Command::new("cmd");
        command
            .raw_arg("/C")
            .raw_arg("start")
            .raw_arg("\"\"")
            .raw_arg("cmd")
            .raw_arg("/K")
            .raw_arg("ssh")
            .raw_arg("-t")
            .raw_arg(host)
            .raw_arg(format!("\"{inner}\""));
        suppress_launcher_window(&mut command)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    }

    #[cfg(not(windows))]
    {
        let args = vec!["ssh".to_string(), "-t".to_string(), host.to_string(), inner];
        let shell_command = shell_join(&args);
        spawn_terminal_raw(&shell_command, None)
    }
}

#[cfg(windows)]
fn suppress_launcher_window(command: &mut Command) -> &mut Command {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    command.creation_flags(CREATE_NO_WINDOW)
}

#[cfg(not(windows))]
fn suppress_launcher_window(command: &mut Command) -> &mut Command {
    command
}

#[cfg(test)]
mod tests {
    use super::validate_remote_host;

    #[test]
    fn validate_remote_host_accepts_common_ssh_targets() {
        for host in [
            "dev-box",
            "user@example.com",
            "user@example.com:2222",
            "[::1]:22",
        ] {
            assert!(validate_remote_host(host).is_ok(), "{host}");
        }
    }

    #[test]
    fn validate_remote_host_rejects_shell_metacharacters() {
        for host in [
            "example.com & calc",
            "bad\"host",
            "bad%USERPROFILE%",
            "bad|host",
        ] {
            assert!(validate_remote_host(host).is_err(), "{host}");
        }
    }
}
