use reqwest::{Client, Method, StatusCode};
use url::Url;

use super::{error::request_error, models::WebDavConfig};

pub(super) async fn test_connection(config: WebDavConfig) -> Result<(), String> {
    validate_config(&config)?;

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|error| error.to_string())?;
    let response = with_auth(
        client.request(Method::OPTIONS, remote_url(&config, None, None)?),
        &config,
    )
    .send()
    .await
    .map_err(request_error)?;

    if response.status().is_success() {
        return Ok(());
    }

    Err(format!("WebDAV connection failed: {}", response.status()))
}

pub(super) async fn create_remote_dir(
    client: &Client,
    config: &WebDavConfig,
) -> Result<(), String> {
    let remote_path = normalized_remote_path(config);
    if remote_path.is_empty() {
        return Ok(());
    }

    let mut current = String::new();
    for part in remote_path.split('/').filter(|part| !part.is_empty()) {
        if !current.is_empty() {
            current.push('/');
        }
        current.push_str(part);
        if remote_dir_exists(client, config, &current).await? {
            continue;
        }

        let url = remote_collection_url(config, &current)?;
        let response = with_auth(
            client.request(
                Method::from_bytes(b"MKCOL").map_err(|error| error.to_string())?,
                url,
            ),
            config,
        )
        .send()
        .await
        .map_err(request_error)?;
        let status = response.status();
        if status.is_success() {
            continue;
        }
        if matches!(
            status,
            StatusCode::METHOD_NOT_ALLOWED | StatusCode::CONFLICT
        ) && remote_dir_exists(client, config, &current).await?
        {
            continue;
        }
        return Err(format!("Failed to create remote directory: {}", status));
    }

    Ok(())
}

async fn remote_dir_exists(
    client: &Client,
    config: &WebDavConfig,
    remote_path: &str,
) -> Result<bool, String> {
    let response = with_auth(
        client
            .request(
                Method::from_bytes(b"PROPFIND").map_err(|error| error.to_string())?,
                remote_collection_url(config, remote_path)?,
            )
            .header("Depth", "0"),
        config,
    )
    .send()
    .await
    .map_err(request_error)?;

    let status = response.status();
    if status.is_success() || status.as_u16() == 207 {
        return Ok(true);
    }
    if matches!(status, StatusCode::NOT_FOUND | StatusCode::CONFLICT) {
        return Ok(false);
    }

    Err(format!("Failed to check remote directory: {}", status))
}

pub(super) fn validate_config(config: &WebDavConfig) -> Result<(), String> {
    if config.endpoint.trim().is_empty() {
        return Err("WebDAV URL is required".to_string());
    }
    remote_file_url(config, "settings.json").map(|_| ())
}

pub(super) fn remote_file_url(config: &WebDavConfig, file_name: &str) -> Result<Url, String> {
    remote_url(
        config,
        Some(&normalized_remote_path(config)),
        Some(file_name),
    )
}

fn remote_url(
    config: &WebDavConfig,
    remote_path: Option<&str>,
    file_name: Option<&str>,
) -> Result<Url, String> {
    // Keep the endpoint path, but drop a trailing empty segment so later pushes
    // do not produce `//folder/file` in the final URL.
    let mut url = Url::parse(config.endpoint.trim()).map_err(|error| error.to_string())?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "Invalid WebDAV URL".to_string())?;
        segments.pop_if_empty();
        if let Some(remote_path) = remote_path {
            for segment in remote_path.split('/').filter(|segment| !segment.is_empty()) {
                segments.push(segment);
            }
        }
        if let Some(file_name) = file_name {
            segments.push(file_name);
        }
    }
    Ok(url)
}

fn remote_collection_url(config: &WebDavConfig, remote_path: &str) -> Result<Url, String> {
    let mut url = Url::parse(config.endpoint.trim()).map_err(|error| error.to_string())?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "Invalid WebDAV URL".to_string())?;
        segments.pop_if_empty();
        for segment in remote_path.split('/').filter(|segment| !segment.is_empty()) {
            segments.push(segment);
        }
        // Trailing empty segment keeps PROPFIND/MKCOL collection URLs slash-terminated.
        segments.push("");
    }
    Ok(url)
}

fn normalized_remote_path(config: &WebDavConfig) -> String {
    config
        .remote_path
        .as_deref()
        .unwrap_or("CodeNest")
        .trim()
        .trim_matches('/')
        .to_string()
}

pub(super) fn with_auth(
    request: reqwest::RequestBuilder,
    config: &WebDavConfig,
) -> reqwest::RequestBuilder {
    let username = config.username.as_deref().unwrap_or("").trim();
    if username.is_empty() {
        return request;
    }
    request.basic_auth(username, config.password.clone())
}

#[cfg(test)]
mod tests {
    use super::{
        normalized_remote_path, remote_collection_url, remote_file_url, validate_config,
    };
    use crate::webdav::models::WebDavConfig;

    fn config(endpoint: &str, remote_path: Option<&str>) -> WebDavConfig {
        WebDavConfig {
            endpoint: endpoint.to_string(),
            username: Some("user".to_string()),
            password: Some("secret".to_string()),
            remote_path: remote_path.map(str::to_string),
        }
    }

    #[test]
    fn validate_config_requires_endpoint() {
        let error = validate_config(&config("   ", None)).expect_err("empty endpoint should fail");
        assert_eq!(error, "WebDAV URL is required");
    }

    #[test]
    fn validate_config_rejects_invalid_urls() {
        let error =
            validate_config(&config("not a url", None)).expect_err("invalid url should fail");
        assert!(!error.is_empty());
    }

    #[test]
    fn remote_file_url_uses_default_codenest_folder() {
        let url = remote_file_url(
            &config("https://dav.example.com/remote.php/dav/files/user", None),
            "settings.json",
        )
        .expect("url should build");

        assert_eq!(
            url.as_str(),
            "https://dav.example.com/remote.php/dav/files/user/CodeNest/settings.json"
        );
    }

    #[test]
    fn remote_file_url_normalizes_custom_remote_path() {
        let url = remote_file_url(
            &config(
                "https://dav.example.com/base/",
                Some("/backup/codenest/"),
            ),
            "projects.json",
        )
        .expect("url should build");

        assert_eq!(
            url.as_str(),
            "https://dav.example.com/base/backup/codenest/projects.json"
        );
    }

    #[test]
    fn remote_collection_url_ends_with_trailing_slash_segment() {
        let url = remote_collection_url(
            &config("https://dav.example.com/base", Some("CodeNest")),
            "CodeNest",
        )
        .expect("collection url should build");

        assert!(url.as_str().ends_with("/CodeNest/"));
    }

    #[test]
    fn normalized_remote_path_defaults_and_trims_slashes() {
        assert_eq!(normalized_remote_path(&config("https://x", None)), "CodeNest");
        assert_eq!(
            normalized_remote_path(&config("https://x", Some(" /Apps/CodeNest/ "))),
            "Apps/CodeNest"
        );
    }
}
