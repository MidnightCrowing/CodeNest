use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
    sync::LazyLock,
};

use serde::Serialize;
use tauri::AppHandle;

use crate::{
    analyzer::{self, LinguistResult},
    command_line::{parse_command_line, quote_command_path, shell_join, shell_quote},
    data,
};

const LICENSE_LINE_LIMIT: usize = 100;

/// 受保护的系统目录根(缓存)
static PROTECTED_SYSTEM_ROOTS: LazyLock<Vec<String>> = LazyLock::new(|| {
    let mut roots = Vec::new();
    if cfg!(windows) {
        for var in [
            "SystemRoot",
            "ProgramFiles",
            "ProgramFiles(x86)",
            "ProgramW6432",
        ] {
            if let Some(value) = env::var_os(var) {
                roots.push(normalize_for_protection_check(Path::new(&value)));
            }
        }
        for fallback in [
            r"C:\Windows",
            r"C:\Program Files",
            r"C:\Program Files (x86)",
        ] {
            roots.push(normalize_for_protection_check(Path::new(fallback)));
        }
    } else {
        for root in [
            "/etc", "/usr", "/bin", "/sbin", "/lib", "/lib64", "/var", "/sys", "/proc",
            "/boot", "/system",
        ] {
            roots.push(root.to_string());
        }
    }
    roots.sort();
    roots.dedup();
    roots
});

/// 去除 Windows canonicalize 产生的 verbatim 前缀(`\\?\` / `\\?\UNC\`)。
fn strip_verbatim_prefix(path: &Path) -> PathBuf {
    let text = path.to_string_lossy();
    if let Some(stripped) = text.strip_prefix(r"\\?\UNC\") {
        PathBuf::from(format!(r"\\{stripped}"))
    } else if let Some(stripped) = text.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        path.to_path_buf()
    }
}

/// 将路径归一化为用于保护检查的形式:去 verbatim 前缀、统一斜杠、
/// 去尾部斜杠,Windows 下转小写。
fn normalize_for_protection_check(path: &Path) -> String {
    let text = strip_verbatim_prefix(path)
        .to_string_lossy()
        .replace('\\', "/");
    let trimmed = text.trim_end_matches('/').to_string();
    if cfg!(windows) {
        trimmed.to_lowercase()
    } else {
        trimmed
    }
}

/// 判断(已 canonicalize 的)路径是否位于受保护的系统目录内。
/// 使用规范化后的路径进行匹配,避免大小写和路径格式差异。
fn is_protected_system_path(canonical: &Path) -> bool {
    let normalized = normalize_for_protection_check(canonical);
    let roots = &*PROTECTED_SYSTEM_ROOTS;

    for root in roots {
        // 精确匹配根目录或其子路径
        if normalized == *root || normalized.starts_with(&format!("{root}/")) {
            return true;
        }
    }

    false
}


#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseReadResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    snippet: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    lines: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

#[derive(Serialize)]
pub struct ProjectMutationResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[tauri::command]
pub async fn analyze_project(folder_path: String) -> Result<LinguistResult, String> {
    let path = Path::new(&folder_path);

    if !path.is_absolute() {
        return Err("Path must be absolute".to_string());
    }

    let canonical_path = path
        .canonicalize()
        .map_err(|_| "Cannot access path".to_string())?;

    if is_protected_system_path(&canonical_path) {
        return Err("Cannot analyze system directory".to_string());
    }

    tauri::async_runtime::spawn_blocking(move || analyzer::analyze_folder(Path::new(&folder_path)))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn read_project_license(folder_path: String, max_lines: Option<usize>) -> LicenseReadResult {
    let root = Path::new(&folder_path);

    if !root.is_absolute() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("Path must be absolute".to_string()),
        };
    }

    let canonical_path = match root.canonicalize() {
        Ok(path) => path,
        Err(_) => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some("Cannot access path".to_string()),
            };
        }
    };

    if is_protected_system_path(&canonical_path) {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("Cannot read from system directory".to_string()),
        };
    }

    if !root.is_dir() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("Project path does not exist or is not a directory".to_string()),
        };
    }

    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(error) => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some(error.to_string()),
            };
        }
    };

    let mut candidates = entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            let file_name = path.file_name()?.to_string_lossy().into_owned();
            let lower = file_name.to_ascii_lowercase();
            (lower.starts_with("license")
                || lower.starts_with("licence")
                || lower.starts_with("copying")
                || lower.starts_with("unlicense"))
            .then_some((file_name, path))
        })
        .collect::<Vec<_>>();

    if candidates.is_empty() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("License file not found".to_string()),
        };
    }

    candidates.sort_by_key(|(file_name, _)| license_rank(file_name));
    let (file_name, path) = candidates.remove(0);
    if !path.is_file() {
        return LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some("License file is not a regular file".to_string()),
        };
    }

    // 检查文件大小,限制最大 1MB
    const MAX_LICENSE_SIZE: u64 = 1024 * 1024;
    match fs::metadata(&path) {
        Ok(metadata) if metadata.len() > MAX_LICENSE_SIZE => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some(format!("License file too large: {} bytes", metadata.len())),
            };
        }
        Err(error) => {
            return LicenseReadResult {
                success: false,
                filename: None,
                snippet: None,
                lines: None,
                message: Some(error.to_string()),
            };
        }
        _ => {}
    }

    match fs::read_to_string(path) {
        Ok(content) => {
            let limit = max_lines.unwrap_or(20).clamp(1, LICENSE_LINE_LIMIT);
            let lines = content.lines().take(limit).collect::<Vec<_>>();
            LicenseReadResult {
                success: true,
                filename: Some(file_name),
                snippet: Some(lines.join("\n")),
                lines: Some(lines.len()),
                message: None,
            }
        }
        Err(error) => LicenseReadResult {
            success: false,
            filename: None,
            snippet: None,
            lines: None,
            message: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn open_project(
    editor_command: String,
    project_path: String,
    open_in_terminal: Option<bool>,
) -> Result<String, String> {
    if editor_command.trim().is_empty() || project_path.is_empty() {
        return Err("Editor command and project path cannot be empty".to_string());
    }

    let project = PathBuf::from(&project_path);
    if !project.is_absolute() {
        return Err("Project path must be absolute".to_string());
    }

    if !project.exists() {
        return Err("Project path does not exist".to_string());
    }

    spawn_editor_command(&editor_command, &project, open_in_terminal.unwrap_or(false))?;
    Ok("Project opened".to_string())
}

/// 打开远程 SSH 项目:VS Code 系走 Remote-SSH,终端走 ssh -t。
///
/// 远程项目没有本地路径,故不做 `is_absolute()/exists()` 校验;
/// 认证/端口/密钥由用户的 ~/.ssh/config 与 ssh 负责。
#[tauri::command]
pub fn open_remote_project(
    host: String,
    remote_path: String,
    editor_command: String,
    mode: String,
) -> Result<String, String> {
    let host = host.trim();
    let remote_path = remote_path.trim();
    if host.is_empty() || remote_path.is_empty() {
        return Err("Remote host and path cannot be empty".to_string());
    }

    match mode.as_str() {
        "terminal" => spawn_remote_terminal(host, remote_path)?,
        "vscode" => {
            if editor_command.trim().is_empty() {
                return Err("Editor command cannot be empty".to_string());
            }
            // 取已配置命令的程序名 token(如 "code"),其余 {project} 之类占位符丢弃
            let args = parse_command_line(&editor_command)?;
            let program = PathBuf::from(&args[0]);
            let remote_args = vec![
                "--remote".to_string(),
                format!("ssh-remote+{host}"),
                remote_path.to_string(),
            ];
            spawn_editor(&program, &remote_args)?;
        }
        other => return Err(format!("Unknown remote open mode: {other}")),
    }

    Ok("Remote project opened".to_string())
}

#[tauri::command]
pub fn detect_editor_command(editor: String) -> Option<String> {
    detect_editor_command_template(&editor)
}

#[tauri::command]
pub fn delete_project(project_path: String) -> ProjectMutationResult {
    let path = PathBuf::from(&project_path);
    if !path.exists() {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Project path does not exist".to_string()),
        };
    }

    if !path.is_absolute() {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Path must be absolute".to_string()),
        };
    }

    let canonical_path = match path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some("Cannot access path".to_string()),
            };
        }
    };

    if is_protected_system_path(&canonical_path) {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Cannot delete system directory".to_string()),
        };
    }

    if trash::delete(&path).is_ok() {
        return ProjectMutationResult {
            success: true,
            message: Some("Project moved to trash".to_string()),
            error: None,
        };
    }

    let result = if path.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    };

    match result {
        Ok(_) => ProjectMutationResult {
            success: true,
            message: Some("Project deleted".to_string()),
            error: None,
        },
        Err(error) => ProjectMutationResult {
            success: false,
            message: None,
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn import_projects(app: AppHandle) -> ProjectMutationResult {
    let Some(imported_path) = rfd::FileDialog::new()
        .add_filter("JSON Files", &["json"])
        .pick_file()
    else {
        return ProjectMutationResult {
            success: false,
            message: Some("No file selected for import".to_string()),
            error: None,
        };
    };

    let target = match data::projects_file_path(&app) {
        Ok(path) => path,
        Err(error) => {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some(error),
            };
        }
    };
    if let Some(parent) = target.parent() {
        if let Err(error) = fs::create_dir_all(parent) {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some(error.to_string()),
            };
        }
    }

    match fs::copy(imported_path, target) {
        Ok(_) => ProjectMutationResult {
            success: true,
            message: Some("Data file imported successfully".to_string()),
            error: None,
        },
        Err(error) => ProjectMutationResult {
            success: false,
            message: None,
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub fn export_projects(app: AppHandle) -> ProjectMutationResult {
    let Some(exported_path) = rfd::FileDialog::new()
        .set_file_name("projects.json")
        .add_filter("JSON Files", &["json"])
        .save_file()
    else {
        return ProjectMutationResult {
            success: false,
            message: Some("No file path selected for export".to_string()),
            error: None,
        };
    };

    let source = match data::projects_file_path(&app) {
        Ok(path) => path,
        Err(error) => {
            return ProjectMutationResult {
                success: false,
                message: None,
                error: Some(error),
            };
        }
    };

    match fs::copy(source, exported_path) {
        Ok(_) => ProjectMutationResult {
            success: true,
            message: Some("Data file exported successfully".to_string()),
            error: None,
        },
        Err(error) => ProjectMutationResult {
            success: false,
            message: None,
            error: Some(error.to_string()),
        },
    }
}

fn spawn_editor_command(
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

fn spawn_editor(program: &Path, args: &[String]) -> Result<(), String> {
    if cfg!(windows) {
        let extension = program
            .extension()
            .and_then(|extension| extension.to_str())
            .map(str::to_ascii_lowercase);
        if matches!(extension.as_deref(), Some("bat" | "cmd")) {
            let mut command = Command::new("cmd");
            command.args(["/C", "start", "", &program.to_string_lossy()]);
            command.args(args);
            command.spawn().map_err(|error| error.to_string())?;
            return Ok(());
        }
    }

    Command::new(program)
        .args(args)
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("Failed to launch {}: {error}", program.display()))
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
        command
            .args(["/C", "start", "", "cmd", "/K", shell_command])
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
    // 远端命令:cd <path> 后保留交互 shell。$SHELL 由远端展开,故整体单引号保护。
    let inner = format!("cd {} ; exec $SHELL -l", posix_single_quote(remote_path));
    let args = vec![
        "ssh".to_string(),
        "-t".to_string(),
        host.to_string(),
        inner,
    ];
    let shell_command = shell_join(&args);
    spawn_terminal_raw(&shell_command, None)
}

fn detect_editor_command_template(editor: &str) -> Option<String> {
    let (commands, common_paths, terminal_default) = editor_detection_candidates(editor)?;
    for command in commands {
        if let Some(path) = find_command_on_path(command) {
            return Some(format_detected_command(&path, editor, terminal_default));
        }
    }
    for path in common_paths {
        if path.exists() {
            return Some(format_detected_command(&path, editor, terminal_default));
        }
    }
    find_editor_in_common_directories(editor)
        .map(|path| format_detected_command(&path, editor, terminal_default))
}

fn editor_detection_candidates(
    editor: &str,
) -> Option<(&'static [&'static str], Vec<PathBuf>, bool)> {
    let mut paths = Vec::new();
    if cfg!(windows) {
        let local_app_data = env::var_os("LOCALAPPDATA").map(PathBuf::from);
        let program_files = env::var_os("ProgramFiles").map(PathBuf::from);
        let program_files_x86 = env::var_os("ProgramFiles(x86)").map(PathBuf::from);

        if let Some((_, _, toolbox_script)) = jetbrains_editor_profile(editor) {
            push_join(
                &mut paths,
                &local_app_data,
                &format!("JetBrains/Toolbox/scripts/{toolbox_script}.cmd"),
            );
        }

        match editor {
            "visual-studio-code" => {
                push_join(
                    &mut paths,
                    &local_app_data,
                    "Programs/Microsoft VS Code/Code.exe",
                );
                push_join(&mut paths, &program_files, "Microsoft VS Code/Code.exe");
            }
            "cursor" => {
                push_join(&mut paths, &local_app_data, "Programs/Cursor/Cursor.exe");
            }
            "windsurf" => {
                push_join(
                    &mut paths,
                    &local_app_data,
                    "Programs/Windsurf/Windsurf.exe",
                );
            }
            "trae" => {
                push_join(&mut paths, &local_app_data, "Programs/Trae/Trae.exe");
            }
            "zed" => {
                push_join(&mut paths, &local_app_data, "Programs/Zed/Zed.exe");
            }
            "sublime-text" => {
                push_join(&mut paths, &program_files, "Sublime Text/sublime_text.exe");
            }
            "android-studio" => {
                push_join(
                    &mut paths,
                    &program_files,
                    "Android/Android Studio/bin/studio64.exe",
                );
            }
            "visual-studio" => {
                for edition in ["Community", "Professional", "Enterprise"] {
                    push_join(
                        &mut paths,
                        &program_files,
                        &format!("Microsoft Visual Studio/2022/{edition}/Common7/IDE/devenv.exe"),
                    );
                    push_join(
                        &mut paths,
                        &program_files_x86,
                        &format!("Microsoft Visual Studio/2022/{edition}/Common7/IDE/devenv.exe"),
                    );
                }
            }
            _ => {}
        }
    }

    let result = if let Some((commands, _, _)) = jetbrains_editor_profile(editor) {
        (commands, false)
    } else {
        match editor {
            "visual-studio" => (&["devenv"][..], false),
            "visual-studio-code" => (&["code"][..], false),
            "android-studio" => (&["studio", "studio64"][..], false),
            "cursor" => (&["cursor"][..], false),
            "windsurf" => (&["windsurf"][..], false),
            "trae" => (&["trae"][..], false),
            "zed" => (&["zed"][..], false),
            "sublime-text" => (&["subl", "sublime_text"][..], false),
            "neovim" => (&["nvim"][..], true),
            "codex-cli" => (&["codex"][..], true),
            "claude-code" => (&["claude"][..], true),
            "gemini-cli" => (&["gemini"][..], true),
            _ => return None,
        }
    };

    Some((result.0, paths, result.1))
}

fn push_join(paths: &mut Vec<PathBuf>, base: &Option<PathBuf>, child: &str) {
    if let Some(base) = base {
        paths.push(base.join(child));
    }
}

fn jetbrains_editor_profile(
    editor: &str,
) -> Option<(
    &'static [&'static str],
    &'static [&'static str],
    &'static str,
)> {
    match editor {
        "intellij-idea" => Some((
            &["idea", "idea64"][..],
            &["idea64.exe", "idea.exe"][..],
            "idea",
        )),
        "pycharm" => Some((
            &["pycharm"][..],
            &["pycharm64.exe", "pycharm.exe"][..],
            "pycharm",
        )),
        "phpstorm" => Some((
            &["phpstorm"][..],
            &["phpstorm64.exe", "phpstorm.exe"][..],
            "phpstorm",
        )),
        "goLand" => Some((
            &["goland"][..],
            &["goland64.exe", "goland.exe"][..],
            "goland",
        )),
        "rider" => Some((&["rider"][..], &["rider64.exe", "rider.exe"][..], "rider")),
        "clion" => Some((&["clion"][..], &["clion64.exe", "clion.exe"][..], "clion")),
        "rust-rover" => Some((
            &["rustrover"][..],
            &["rustrover64.exe", "rustrover.exe"][..],
            "rustrover",
        )),
        "webstorm" => Some((
            &["webstorm"][..],
            &["webstorm64.exe", "webstorm.exe"][..],
            "webstorm",
        )),
        "rubymine" => Some((
            &["rubymine"][..],
            &["rubymine64.exe", "rubymine.exe"][..],
            "rubymine",
        )),
        _ => None,
    }
}

fn find_command_on_path(command: &str) -> Option<PathBuf> {
    let path_var = env::var_os("PATH")?;
    let extensions = if cfg!(windows) {
        env::var("PATHEXT")
            .unwrap_or_else(|_| ".EXE;.CMD;.BAT".to_string())
            .split(';')
            .map(str::to_ascii_lowercase)
            .collect::<Vec<_>>()
    } else {
        vec![String::new()]
    };

    for dir in env::split_paths(&path_var) {
        if cfg!(windows) {
            for extension in &extensions {
                let candidate = dir.join(format!("{command}{extension}"));
                if candidate.is_file() {
                    return Some(candidate);
                }
            }
        } else {
            let candidate = dir.join(command);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

fn find_editor_in_common_directories(editor: &str) -> Option<PathBuf> {
    if !cfg!(windows) {
        return None;
    }

    let (_, names, _) = jetbrains_editor_profile(editor)?;

    let roots = [
        env::var_os("LOCALAPPDATA")
            .map(PathBuf::from)
            .map(|path| path.join("Programs")),
        env::var_os("ProgramFiles").map(PathBuf::from),
        env::var_os("ProgramFiles(x86)").map(PathBuf::from),
    ];

    for root in roots.into_iter().flatten() {
        if let Some(path) = find_file_with_names(&root, names, 4) {
            return Some(path);
        }
    }

    None
}

fn find_file_with_names(root: &Path, names: &[&str], depth: usize) -> Option<PathBuf> {
    if depth == 0 || !root.is_dir() {
        return None;
    }

    let entries = fs::read_dir(root).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            let file_name = path.file_name()?.to_string_lossy().to_ascii_lowercase();
            if names.iter().any(|name| file_name == *name) {
                return Some(path);
            }
        } else if path.is_dir() {
            let dir_name = path.file_name()?.to_string_lossy().to_ascii_lowercase();
            let should_search = dir_name.contains("jetbrains")
                || dir_name.contains("intellij")
                || dir_name.contains("pycharm")
                || dir_name.contains("webstorm")
                || dir_name.contains("goland")
                || dir_name.contains("rider")
                || dir_name.contains("clion")
                || dir_name.contains("rustrover")
                || dir_name.contains("phpstorm")
                || dir_name.contains("rubymine")
                || dir_name == "bin";
            if should_search {
                if let Some(found) = find_file_with_names(&path, names, depth - 1) {
                    return Some(found);
                }
            }
        }
    }

    None
}

fn format_detected_command(path: &Path, editor: &str, terminal_default: bool) -> String {
    let command = quote_command_path(path);
    if terminal_default {
        if matches!(editor, "neovim") {
            format!("{command} .")
        } else {
            command
        }
    } else {
        format!("{command} {{project}}")
    }
}

fn license_rank(file_name: &str) -> u8 {
    let lower = file_name.to_ascii_lowercase();
    let path = Path::new(&lower);
    let stem = path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .unwrap_or(&lower);
    let extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("");

    let base_score = if stem.starts_with("license") {
        0
    } else if stem.starts_with("licence") {
        1
    } else if stem.starts_with("copying") {
        2
    } else if stem.starts_with("unlicense") {
        3
    } else {
        9
    };
    let extension_score = match extension {
        "" => 0,
        "md" => 1,
        "txt" => 2,
        _ => 3,
    };

    base_score * 10 + extension_score
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{is_protected_system_path, strip_verbatim_prefix};

    #[test]
    #[cfg(windows)]
    fn strip_verbatim_prefix_removes_windows_prefix() {
        assert_eq!(
            strip_verbatim_prefix(Path::new(r"\\?\C:\Windows")),
            Path::new(r"C:\Windows").to_path_buf()
        );
        assert_eq!(
            strip_verbatim_prefix(Path::new(r"\\?\UNC\server\share")),
            Path::new(r"\\server\share").to_path_buf()
        );
    }

    #[test]
    #[cfg(windows)]
    fn protected_path_check_matches_system_roots() {
        assert!(is_protected_system_path(Path::new(r"\\?\C:\Windows")));
        assert!(is_protected_system_path(Path::new(
            r"\\?\C:\Windows\System32"
        )));
        assert!(is_protected_system_path(Path::new(
            r"C:\Program Files\Some App"
        )));
        assert!(is_protected_system_path(Path::new(
            r"C:\Program Files (x86)\Some App"
        )));
    }

    #[test]
    #[cfg(windows)]
    fn protected_path_check_does_not_overmatch_siblings() {
        assert!(!is_protected_system_path(Path::new(r"C:\Windows-backup")));
        assert!(!is_protected_system_path(Path::new(r"C:\Program Filesx")));
        assert!(!is_protected_system_path(Path::new(r"E:\Projects\demo")));
    }

    #[test]
    #[cfg(not(windows))]
    fn protected_path_check_matches_unix_roots() {
        assert!(is_protected_system_path(Path::new("/etc")));
        assert!(is_protected_system_path(Path::new("/usr/bin")));
        assert!(!is_protected_system_path(Path::new("/home/user/projects")));
        assert!(!is_protected_system_path(Path::new("/etcetera")));
    }
}
