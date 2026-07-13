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

#[cfg(test)]
mod tests {
    use super::{sync_error, sync_success};

    #[test]
    fn sync_success_sets_message_without_error() {
        let result = sync_success("uploaded".to_string());
        let value = serde_json::to_value(result).expect("result should serialize");
        assert_eq!(value["success"], true);
        assert_eq!(value["message"], "uploaded");
        assert!(value.get("error").is_none());
    }

    #[test]
    fn sync_error_sets_error_without_message() {
        let result = sync_error("failed".to_string());
        let value = serde_json::to_value(result).expect("result should serialize");
        assert_eq!(value["success"], false);
        assert_eq!(value["error"], "failed");
        assert!(value.get("message").is_none());
    }
}
