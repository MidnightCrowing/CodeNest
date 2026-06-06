use serde::{Deserialize, Serialize};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckUpdateResult {
    has_update: bool,
    current_version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    latest_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    published_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Deserialize)]
struct GithubRelease {
    tag_name: Option<String>,
    html_url: Option<String>,
    name: Option<String>,
    body: Option<String>,
    published_at: Option<String>,
}

#[tauri::command]
pub async fn check_update() -> CheckUpdateResult {
    let current_version = env!("CARGO_PKG_VERSION").to_string();
    let request = reqwest::Client::new()
        .get("https://api.github.com/repos/MidnightCrowing/CodeNest/releases/latest")
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "CodeNest (Tauri)");

    let response = match request.send().await {
        Ok(response) => response,
        Err(error) => return update_error(current_version, error.to_string()),
    };

    if !response.status().is_success() {
        return update_error(
            current_version,
            format!("Request failed: {}", response.status()),
        );
    }

    let release = match response.json::<GithubRelease>().await {
        Ok(release) => release,
        Err(error) => return update_error(current_version, error.to_string()),
    };

    let latest_version = normalize_version(release.tag_name.as_deref().or(release.name.as_deref()));
    let has_update = compare_semver(&current_version, &latest_version) < 0;

    CheckUpdateResult {
        has_update,
        current_version,
        latest_version: Some(latest_version),
        url: release.html_url.or_else(|| {
            Some("https://github.com/MidnightCrowing/CodeNest/releases/latest".to_string())
        }),
        name: release.name,
        notes: release.body,
        published_at: release.published_at,
        error: None,
    }
}

fn update_error(current_version: String, error: String) -> CheckUpdateResult {
    CheckUpdateResult {
        has_update: false,
        current_version,
        latest_version: None,
        url: None,
        name: None,
        notes: None,
        published_at: None,
        error: Some(error),
    }
}

fn normalize_version(version: Option<&str>) -> String {
    version
        .unwrap_or("0.0.0")
        .trim()
        .trim_start_matches(['v', 'V'])
        .split(['+', '-'])
        .next()
        .unwrap_or("0.0.0")
        .to_string()
}

fn compare_semver(a: &str, b: &str) -> i8 {
    let a_parts = normalize_version(Some(a))
        .split('.')
        .map(|part| part.parse::<i32>().unwrap_or(0))
        .collect::<Vec<_>>();
    let b_parts = normalize_version(Some(b))
        .split('.')
        .map(|part| part.parse::<i32>().unwrap_or(0))
        .collect::<Vec<_>>();

    for index in 0..a_parts.len().max(b_parts.len()) {
        let a_value = *a_parts.get(index).unwrap_or(&0);
        let b_value = *b_parts.get(index).unwrap_or(&0);
        if a_value > b_value {
            return 1;
        }
        if a_value < b_value {
            return -1;
        }
    }
    0
}

#[cfg(test)]
mod tests {
    use super::{compare_semver, normalize_version};

    #[test]
    fn normalize_version_removes_prefix_and_suffix() {
        assert_eq!(normalize_version(Some(" v1.2.3-beta.1+build ")), "1.2.3");
        assert_eq!(normalize_version(Some("V2.0.0")), "2.0.0");
    }

    #[test]
    fn normalize_version_defaults_when_missing() {
        assert_eq!(normalize_version(None), "0.0.0");
        assert_eq!(normalize_version(Some("")), "");
    }

    #[test]
    fn compare_semver_handles_missing_segments() {
        assert_eq!(compare_semver("1.2", "1.2.0"), 0);
        assert_eq!(compare_semver("1.2.1", "1.2"), 1);
    }

    #[test]
    fn compare_semver_orders_versions() {
        assert_eq!(compare_semver("1.2.3", "1.2.4"), -1);
        assert_eq!(compare_semver("1.3.0", "1.2.9"), 1);
        assert_eq!(compare_semver("v1.0.0-beta", "1.0.0"), 0);
    }
}
