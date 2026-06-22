use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebDavConfig {
    pub(super) endpoint: String,
    pub(super) username: Option<String>,
    pub(super) password: Option<String>,
    pub(super) remote_path: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WebDavSyncResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

pub(super) fn sync_success(message: String) -> WebDavSyncResult {
    WebDavSyncResult {
        success: true,
        message: Some(message),
        error: None,
    }
}

pub(super) fn sync_error(error: String) -> WebDavSyncResult {
    WebDavSyncResult {
        success: false,
        message: None,
        error: Some(error),
    }
}
