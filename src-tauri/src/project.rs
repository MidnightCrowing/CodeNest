use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
};

use serde::Serialize;
use tauri::AppHandle;

use crate::{
    analyzer::{self, LinguistResult},
    command_line::{parse_command_line, quote_command_path, shell_join, shell_quote},
    data,
};

const LICENSE_LINE_LIMIT: usize = 100;

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
    tauri::async_runtime::spawn_blocking(move || analyzer::analyze_folder(Path::new(&folder_path)))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn read_project_license(folder_path: String, max_lines: Option<usize>) -> LicenseReadResult {
    let root = Path::new(&folder_path);
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

    spawn_editor_command(&editor_command, &project, open_in_terminal.unwrap_or(false))?;
    Ok("Project opened".to_string())
}

#[tauri::command]
pub fn detect_editor_command(editor: String) -> Option<String> {
    detect_editor_command_template(&editor)
}

#[tauri::command]
pub fn delete_project(project_path: String) -> ProjectMutationResult {
    let path = PathBuf::from(project_path);
    if !path.exists() {
        return ProjectMutationResult {
            success: false,
            message: None,
            error: Some("Project path does not exist".to_string()),
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
    if args.is_empty() {
        return Err("Editor command cannot be empty".to_string());
    }

    let project_text = project.to_string_lossy().into_owned();
    for arg in &mut args {
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
        .map_err(|error| error.to_string())
}

fn spawn_terminal_command(args: &[String], project: &Path) -> Result<(), String> {
    let shell_command = shell_join(args);

    if cfg!(windows) {
        Command::new("cmd")
            .current_dir(project)
            .args(["/C", "start", "", "cmd", "/K", &shell_command])
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    } else if cfg!(target_os = "macos") {
        let command = format!(
            "cd {}; {}",
            shell_quote(&project.to_string_lossy()),
            shell_command
        );
        let script = format!(
            "tell application \"Terminal\" to do script \"{}\"",
            command.replace('\\', "\\\\").replace('"', "\\\"")
        );
        Command::new("osascript")
            .args(["-e", &script])
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    } else {
        Command::new("x-terminal-emulator")
            .current_dir(project)
            .args(["-e", "sh", "-lc", &shell_command])
            .spawn()
            .or_else(|_| {
                Command::new("gnome-terminal")
                    .current_dir(project)
                    .args(["--", "sh", "-lc", &shell_command])
                    .spawn()
            })
            .map(|_| ())
            .map_err(|error| error.to_string())
    }
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
