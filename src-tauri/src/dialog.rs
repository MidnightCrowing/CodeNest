use serde::Deserialize;

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
pub fn open_folder_dialog(options: Option<DialogOpenOptions>) -> Option<String> {
    let mut dialog = rfd::FileDialog::new();
    if let Some(title) = options.and_then(|o| o.title) {
        dialog = dialog.set_title(title);
    }

    dialog.pick_folder().map(path_to_string)
}

#[tauri::command]
pub fn open_file_dialog(options: Option<FileDialogOptions>) -> Option<String> {
    let mut dialog = rfd::FileDialog::new();

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

    dialog.pick_file().map(path_to_string)
}
