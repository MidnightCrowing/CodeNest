use std::{
    env, fs,
    path::{Path, PathBuf},
};

use crate::command_line::quote_command_path;

pub(super) fn detect_editor_command_template(editor: &str) -> Option<String> {
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
