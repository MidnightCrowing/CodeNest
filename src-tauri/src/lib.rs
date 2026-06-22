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

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            data::delete_data,
            data::load_data,
            data::open_data,
            data::save_data,
            dialog::open_file_dialog,
            dialog::open_folder_dialog,
            project::commands::analyze_project,
            project::commands::delete_project,
            project::editor::detect_editor_command,
            project::commands::export_projects,
            project::commands::import_projects,
            project::editor::open_project,
            project::editor::open_remote_project,
            project::license::read_project_license,
            scanner::detect_cli_history_root_path,
            scanner::detect_jetbrains_config_root_path,
            scanner::detect_recent_editor_state_db_path,
            scanner::detect_vscode_state_db_path,
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
            webdav::webdav_pull_data,
            webdav::webdav_test_connection,
            webdav::webdav_upload_data,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run CodeNest");
}
