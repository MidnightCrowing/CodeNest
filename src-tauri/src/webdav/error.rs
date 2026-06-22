use std::sync::LazyLock;

use regex::Regex;

static URL_CREDENTIALS_PATTERN: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"://[^:/@\s]+:[^@/\s]+@").expect("hardcoded regex should be valid")
});

/// 从错误消息中遮蔽 `scheme://user:pass@host` 形式的凭据,
/// 防止 reqwest 错误把 Basic Auth 信息透传给前端。
fn sanitize_url_for_error(error_msg: &str) -> String {
    URL_CREDENTIALS_PATTERN
        .replace_all(error_msg, "://***:***@")
        .to_string()
}

/// reqwest 错误统一脱敏转换。
pub(super) fn request_error(error: reqwest::Error) -> String {
    sanitize_url_for_error(&error.to_string())
}

#[cfg(test)]
mod tests {
    use super::sanitize_url_for_error;

    #[test]
    fn sanitize_url_for_error_masks_credentials() {
        assert_eq!(
            sanitize_url_for_error(
                "error sending request for url (https://user:secret@dav.example.com/path)"
            ),
            "error sending request for url (https://***:***@dav.example.com/path)"
        );
    }

    #[test]
    fn sanitize_url_for_error_keeps_urls_without_credentials() {
        let message = "error sending request for url (https://dav.example.com/path)";
        assert_eq!(sanitize_url_for_error(message), message);
    }

    #[test]
    fn sanitize_url_for_error_handles_multiple_urls() {
        assert_eq!(
            sanitize_url_for_error("from http://a:b@x.com to https://c:d@y.com"),
            "from http://***:***@x.com to https://***:***@y.com"
        );
    }

    #[test]
    fn sanitize_url_for_error_handles_ipv6_hosts() {
        assert_eq!(
            sanitize_url_for_error("error at https://user:secret@[::1]:8080/path"),
            "error at https://***:***@[::1]:8080/path"
        );
    }
}
