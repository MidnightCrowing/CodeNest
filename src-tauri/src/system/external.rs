use std::path::PathBuf;

pub(super) fn open_external(url: String) -> bool {
    open::that(url).is_ok()
}

pub(super) fn open_in_explorer(path: String) -> bool {
    open_path_in_explorer(PathBuf::from(path))
}

#[cfg(windows)]
fn open_path_in_explorer(path: PathBuf) -> bool {
    std::process::Command::new("explorer.exe")
        .arg(path)
        .spawn()
        .is_ok()
}

#[cfg(not(windows))]
fn open_path_in_explorer(path: PathBuf) -> bool {
    open::that_detached(path).is_ok()
}
