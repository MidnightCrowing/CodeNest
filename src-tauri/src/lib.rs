mod analyzer;
mod command_line;
mod data;
mod dialog;
mod project;
mod recent;
mod scanner;
mod secret;
mod system;
mod updater;
mod webdav;

use tauri::Manager;
use tauri_plugin_log::RotationStrategy;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .max_file_size(1_000_000)
                .rotation_strategy(RotationStrategy::KeepSome(5))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(updater::PendingUpdate::default())
        .invoke_handler(tauri::generate_handler![
            data::delete_data,
            data::load_data,
            data::open_data,
            data::save_data,
            dialog::open_file_dialog,
            dialog::open_folder_dialog,
            project::commands::analyze_project,
            project::commands::delete_project,
            project::commands::detect_project_git_metadata,
            project::editor::detect_editor_command,
            project::commands::export_projects,
            project::commands::get_language_color,
            project::commands::import_projects,
            project::editor::open_project,
            project::editor::open_remote_project,
            project::license::read_project_license,
            scanner::detect_cli_history_root_path,
            scanner::detect_jetbrains_config_root_path,
            scanner::detect_recent_editor_state_db_path,
            scanner::scan_projects,
            secret::delete_webdav_password,
            secret::load_webdav_password,
            secret::save_webdav_password,
            system::check_path_existence,
            system::close_window,
            system::format_path,
            system::get_system_accent_color,
            system::minimize_window,
            system::open_external,
            system::open_in_explorer,
            system::open_in_terminal,
            system::set_window_theme,
            system::toggle_maximize_window,
            updater::check_update,
            updater::install_update,
            webdav::webdav_pull_data,
            webdav::webdav_test_connection,
            webdav::webdav_upload_data,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run CodeNest");
}
