use keyring::{Entry, Error};

const SERVICE: &str = "CodeNest";
const WEBDAV_PASSWORD_USER: &str = "webdav-password";

fn webdav_password_entry() -> Result<Entry, String> {
    Entry::new(SERVICE, WEBDAV_PASSWORD_USER).map_err(format_keyring_error)
}

fn format_keyring_error(error: Error) -> String {
    format!("Secure credential storage error: {error}")
}

#[tauri::command]
pub fn load_webdav_password() -> Result<Option<String>, String> {
    match webdav_password_entry()?.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(Error::NoEntry) => Ok(None),
        Err(error) => Err(format_keyring_error(error)),
    }
}

#[tauri::command]
pub fn save_webdav_password(password: String) -> Result<(), String> {
    if password.is_empty() {
        return delete_webdav_password();
    }

    webdav_password_entry()?
        .set_password(&password)
        .map_err(format_keyring_error)
}

#[tauri::command]
pub fn delete_webdav_password() -> Result<(), String> {
    match webdav_password_entry()?.delete_credential() {
        Ok(()) | Err(Error::NoEntry) => Ok(()),
        Err(error) => Err(format_keyring_error(error)),
    }
}
