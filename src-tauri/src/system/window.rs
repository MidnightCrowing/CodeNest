pub(super) fn minimize_window(window: tauri::WebviewWindow) -> bool {
    window.minimize().is_ok()
}

pub(super) fn toggle_maximize_window(window: tauri::WebviewWindow) -> bool {
    match window.is_maximized() {
        Ok(true) => window.unmaximize().is_ok(),
        Ok(false) => window.maximize().is_ok(),
        Err(_) => false,
    }
}

pub(super) fn close_window(window: tauri::WebviewWindow) -> bool {
    window.close().is_ok()
}
