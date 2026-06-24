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
        // 占位符替换发生在 parse_command_line 之后:GUI 路径下参数直接传给
        // Command::args 不经过 shell;终端路径下由 shell_join/shell_quote 统一转义。
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

    match mode {
        "terminal" => spawn_remote_terminal(host, remote_path),
        "vscode" => {
            if editor_command.trim().is_empty() {
                return Err("Editor command cannot be empty".to_string());
            }
            // 取已配置命令的程序名 token(如 "code"),其余 {project} 之类占位符丢弃
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

fn spawn_editor(program: &Path, args: &[String]) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // CREATE_NO_WINDOW 抑制控制台窗口:编辑器启动器常是 code.cmd 之类的批处理,
        // 默认会让 Windows 给它分配一个控制台窗口(表现为弹出终端)。
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;

        let extension = program
            .extension()
            .and_then(|extension| extension.to_str())
            .map(str::to_ascii_lowercase);

        if matches!(extension.as_deref(), Some("bat" | "cmd")) {
            // .cmd/.bat 不是 PE 可执行文件,必须经 cmd 运行(直接 CreateProcess 会报
            // “不是有效的 Win32 应用程序”)。cmd /C 会去除整条命令行的首尾引号,因此把
            // “程序 + 参数”整体再包一层引号;参数(路径 / --remote / ssh-remote+host)
            // 不含双引号,逐个加引号即可安全。
            let mut line = String::new();
            line.push('"'); // 外层起始引号
            line.push('"');
            line.push_str(&program.to_string_lossy());
            line.push('"'); // 程序路径引号
            for arg in args {
                line.push_str(" \"");
                line.push_str(arg);
                line.push('"');
            }
            line.push('"'); // 外层结束引号

            return Command::new("cmd")
                .raw_arg("/C")
                .raw_arg(&line)
                .creation_flags(CREATE_NO_WINDOW)
                .spawn()
                .map(|_| ())
                .map_err(|error| format!("Failed to launch {}: {error}", program.display()));
        }

        return Command::new(program)
            .args(args)
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map(|_| ())
            .map_err(|error| format!("Failed to launch {}: {error}", program.display()));
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
        // macOS 的 Terminal.app 通过 osascript 启动,不继承 current_dir,
        // 因此把 cd 前缀嵌入命令字符串。
        let project_str = project.to_string_lossy();
        let full_command = format!("cd {} ; {}", shell_quote(&project_str), shell_command);
        spawn_terminal_raw(&full_command, None)
    } else {
        spawn_terminal_raw(&shell_command, Some(project))
    }
}

/// 在系统终端窗口中运行一条 shell 命令。
///
/// `cwd` 仅用于 Windows/Linux 的 `current_dir`;macOS 不继承 current_dir,
/// 调用方需把 `cd` 嵌入命令字符串(远程场景由 ssh 自身 cd,无需本地 cwd)。
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
        // AppleScript 字符串需要转义反斜杠和双引号
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

/// 以 POSIX 单引号包裹远程路径(始终面向远程的 POSIX shell,
/// 不能用本地平台相关的 shell_quote)。
fn posix_single_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}

/// 打开终端并通过 ssh 进入远程目录。
fn spawn_remote_terminal(host: &str, remote_path: &str) -> Result<(), String> {
    // 远端命令:cd <path> 后保留交互 shell。$SHELL 由远端展开,故路径用 POSIX 单引号保护。
    let inner = format!("cd {} ; exec $SHELL -l", posix_single_quote(remote_path));

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // 用 raw_arg 精确拼出命令行:Rust 默认的 MSVCRT 转义(\")与 cmd 的解析规则冲突,
        // 会把 host 连同引号一起塞给 ssh,导致 “hostname contains invalid characters”。
        // host 不含空格,直接传;远端命令整体用双引号包成 ssh 的单个参数。
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
        return suppress_launcher_window(&mut command)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string());
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
