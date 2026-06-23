use std::path::PathBuf;

pub(super) fn open_external(url: String) -> bool {
    open::that(url).is_ok()
}

pub(super) fn open_in_explorer(path: String) -> bool {
    open::that(PathBuf::from(path)).is_ok()
}
