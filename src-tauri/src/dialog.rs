use serde::Deserialize;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

#[derive(Deserialize)]
pub struct DialogOpenOptions {
    title: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileDialogOptions {
    title: Option<String>,
    file_types: Option<Vec<FileTypeFilter>>,
}

#[derive(Deserialize)]
struct FileTypeFilter {
    name: String,
    extensions: Vec<String>,
}

fn path_to_string(path: std::path::PathBuf) -> String {
    path.to_string_lossy().into_owned()
}

#[tauri::command]
pub async fn open_folder_dialog(
    app: AppHandle,
    options: Option<DialogOpenOptions>,
) -> Option<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut dialog = app.dialog().file();
        if let Some(title) = options.and_then(|options| options.title) {
            dialog = dialog.set_title(title);
        }

        dialog
            .blocking_pick_folder()?
            .into_path()
            .ok()
            .map(path_to_string)
    })
    .await
    .ok()
    .flatten()
}

#[tauri::command]
pub async fn open_file_dialog(
    app: AppHandle,
    options: Option<FileDialogOptions>,
) -> Option<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut dialog = app.dialog().file();

        if let Some(options) = options {
            if let Some(title) = options.title {
                dialog = dialog.set_title(title);
            }

            for filter in options.file_types.unwrap_or_default() {
                let extensions: Vec<&str> = filter
                    .extensions
                    .iter()
                    .filter(|extension| extension.as_str() != "*")
                    .map(String::as_str)
                    .collect();
                if !extensions.is_empty() {
                    dialog = dialog.add_filter(filter.name, &extensions);
                }
            }
        }

        dialog
            .blocking_pick_file()?
            .into_path()
            .ok()
            .map(path_to_string)
    })
    .await
    .ok()
    .flatten()
}
