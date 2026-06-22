use std::{
    io,
    path::{Path, PathBuf},
    process::Command,
};

use crate::command_line::parse_command_line;

pub(super) fn open_in_terminal(
    path: String,
    terminal_command: Option<String>,
) -> Result<String, String> {
    let path = PathBuf::from(path);
    if !path.is_dir() {
        return Err("Project path is not a directory".to_string());
    }

    if let Some(command) = terminal_command
        .as_deref()
        .map(str::trim)
        .filter(|cmd| !cmd.is_empty())
    {
        spawn_configured_terminal(command, &path)?;
    } else {
        spawn_default_terminal(&path)?;
    }

    Ok("Terminal opened".to_string())
}

fn spawn_configured_terminal(command_template: &str, cwd: &Path) -> Result<(), String> {
    let args = configured_terminal_args(command_template, cwd)?;
    let program = PathBuf::from(&args[0]);
    spawn_terminal_program(&program, &args[1..], cwd)
}

fn configured_terminal_args(command_template: &str, cwd: &Path) -> Result<Vec<String>, String> {
    let mut args = parse_command_line(command_template)?;

    let cwd_text = cwd.to_string_lossy().into_owned();
    for arg in &mut args {
        // 占位符替换发生在 parse_command_line 之后,替换结果作为单个
        // 参数直接传给 Command::args,不经过 shell 解析,无需再转义。
        *arg = arg
            .replace("{cwd}", &cwd_text)
            .replace("{project}", &cwd_text);
    }

    Ok(args)
}

fn spawn_terminal_program(program: &Path, args: &[String], cwd: &Path) -> Result<(), String> {
    if cfg!(windows) {
        if let Some(shell) = windows_shell_program_name(program) {
            return spawn_windows_shell_terminal(&shell, args, cwd);
        }

        let extension = program
            .extension()
            .and_then(|extension| extension.to_str())
            .map(str::to_ascii_lowercase);
        if matches!(extension.as_deref(), Some("bat" | "cmd")) {
            let mut command = Command::new("cmd");
            command.current_dir(cwd);
            command.args(["/C", "start", "", &program.to_string_lossy()]);
            command.args(args);
            command.spawn().map_err(|error| error.to_string())?;
            return Ok(());
        }
    }

    Command::new(program)
        .current_dir(cwd)
        .args(args)
        .spawn()
        .map(|_| ())
        .map_err(|error| format_spawn_error(program, error))
}

fn format_spawn_error(program: &Path, error: io::Error) -> String {
    if error.kind() == io::ErrorKind::NotFound {
        return format!("Command not found: {}", program.to_string_lossy());
    }

    error.to_string()
}

fn windows_shell_program_name(program: &Path) -> Option<String> {
    let name = program
        .file_stem()
        .or_else(|| program.file_name())
        .and_then(|name| name.to_str())?
        .to_ascii_lowercase();

    matches!(name.as_str(), "cmd" | "powershell" | "pwsh").then_some(name)
}

fn spawn_windows_shell_terminal(shell: &str, args: &[String], cwd: &Path) -> Result<(), String> {
    let mut command = Command::new("cmd");
    command.current_dir(cwd);
    command.args(["/C", "start", "", shell]);

    if args.is_empty() {
        if shell == "cmd" {
            command.arg("/K");
        } else {
            command.arg("-NoExit");
        }
    } else {
        command.args(args);
    }

    command
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn spawn_default_terminal(cwd: &Path) -> Result<(), String> {
    if cfg!(windows) {
        spawn_default_windows_terminal(cwd)
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .arg("-a")
            .arg("Terminal")
            .arg(cwd)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    } else {
        Command::new("x-terminal-emulator")
            .current_dir(cwd)
            .spawn()
            .or_else(|_| Command::new("gnome-terminal").current_dir(cwd).spawn())
            .or_else(|_| Command::new("konsole").current_dir(cwd).spawn())
            .map(|_| ())
            .map_err(|error| error.to_string())
    }
}

fn spawn_default_windows_terminal(cwd: &Path) -> Result<(), String> {
    let cwd_text = cwd.to_string_lossy();
    let mut errors = Vec::new();

    match Command::new("wt").arg("-d").arg(cwd).spawn() {
        Ok(_) => return Ok(()),
        Err(error) => errors.push(format!("wt: {error}")),
    }

    let powershell_command = format!(
        "Set-Location -LiteralPath '{}'",
        cwd_text.replace('\'', "''")
    );
    match Command::new("pwsh")
        .args(["-NoExit", "-Command", &powershell_command])
        .spawn()
    {
        Ok(_) => return Ok(()),
        Err(error) => errors.push(format!("pwsh: {error}")),
    }

    match Command::new("powershell")
        .args(["-NoExit", "-Command", &powershell_command])
        .spawn()
    {
        Ok(_) => return Ok(()),
        Err(error) => errors.push(format!("powershell: {error}")),
    }

    match Command::new("cmd")
        .current_dir(cwd)
        .args(["/C", "start", "", "cmd", "/K"])
        .spawn()
    {
        Ok(_) => Ok(()),
        Err(error) => {
            errors.push(format!("cmd: {error}"));
            Err(format!("Failed to open terminal: {}", errors.join("; ")))
        }
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::configured_terminal_args;

    #[test]
    fn configured_terminal_args_keeps_cwd_with_spaces_as_one_arg() {
        let args =
            configured_terminal_args("wt -d {cwd}", Path::new(r"E:\Projects\Example App")).unwrap();

        assert_eq!(args, vec!["wt", "-d", r"E:\Projects\Example App"]);
    }
}
