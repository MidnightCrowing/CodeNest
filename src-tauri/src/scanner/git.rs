use std::{
    fs,
    path::{Path, PathBuf},
};

use serde::Serialize;

use super::models::DetectedProjectKind;

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectGitMetadata {
    pub kind: DetectedProjectKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_name: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct GitRemote {
    name: String,
    url: Option<String>,
}

pub(super) fn is_git_project(path: &Path) -> bool {
    path.join(".git").exists()
}

pub fn detect_project_git_metadata(path: &Path) -> Option<ProjectGitMetadata> {
    let git_config = find_git_config(path)?;
    let config = fs::read_to_string(git_config).ok()?;

    let mut has_origin = false;
    let mut has_upstream = false;
    let mut origin_url = None;
    let mut upstream_url = None;
    for remote in parse_remotes(&config) {
        match remote.name.as_str() {
            "upstream" => {
                has_upstream = true;
                upstream_url = remote.url;
            }
            "origin" => {
                has_origin = true;
                origin_url = remote.url;
            }
            _ => {}
        }
    }

    let (kind, from_url) = if has_upstream {
        (DetectedProjectKind::Fork, upstream_url)
    } else if has_origin {
        (DetectedProjectKind::Clone, origin_url)
    } else {
        (DetectedProjectKind::Mine, None)
    };
    let from_name = from_url.as_deref().and_then(source_name_from_url);

    Some(ProjectGitMetadata {
        kind,
        from_url,
        from_name,
    })
}

fn find_git_config(path: &Path) -> Option<PathBuf> {
    let git_path = path.join(".git");
    if git_path.is_dir() {
        return Some(git_path.join("config"));
    }

    let git_file = fs::read_to_string(&git_path).ok()?;
    let git_dir = parse_gitdir_file(&git_file, path)?;
    let config = git_dir.join("config");
    if config.exists() {
        return Some(config);
    }

    let common_dir = find_common_git_dir(&git_dir)?;
    Some(common_dir.join("config"))
}

fn parse_gitdir_file(contents: &str, worktree_path: &Path) -> Option<PathBuf> {
    let value = contents.trim().strip_prefix("gitdir:")?.trim();
    let git_dir = PathBuf::from(value);
    Some(if git_dir.is_absolute() {
        git_dir
    } else {
        worktree_path.join(git_dir)
    })
}

fn find_common_git_dir(git_dir: &Path) -> Option<PathBuf> {
    let common_dir = fs::read_to_string(git_dir.join("commondir")).ok()?;
    let common_dir = PathBuf::from(common_dir.trim());
    Some(if common_dir.is_absolute() {
        common_dir
    } else {
        git_dir.join(common_dir)
    })
}

fn parse_remotes(config: &str) -> Vec<GitRemote> {
    let mut remotes = Vec::new();
    let mut current_remote: Option<GitRemote> = None;

    for line in config.lines().map(str::trim) {
        if let Some(name) = parse_remote_section(line) {
            if let Some(remote) = current_remote.take() {
                remotes.push(remote);
            }
            current_remote = Some(GitRemote { name, url: None });
            continue;
        }

        if line.starts_with('[') {
            if let Some(remote) = current_remote.take() {
                remotes.push(remote);
            }
            continue;
        }

        let Some(remote) = current_remote.as_mut() else {
            continue;
        };
        if let Some(url) = parse_git_config_value(line, "url") {
            remote.url = Some(url);
        }
    }

    if let Some(remote) = current_remote {
        remotes.push(remote);
    }

    remotes
}

fn parse_remote_section(line: &str) -> Option<String> {
    let rest = line.strip_prefix("[remote ")?;
    let name = rest.trim().strip_prefix('"')?.strip_suffix("\"]")?;
    (!name.is_empty()).then(|| name.to_string())
}

fn parse_git_config_value(line: &str, key: &str) -> Option<String> {
    let (left, right) = line.split_once('=')?;
    if left.trim() != key {
        return None;
    }
    let value = right.trim();
    (!value.is_empty()).then(|| value.to_string())
}

fn source_name_from_url(url: &str) -> Option<String> {
    let mut path = url.trim().trim_end_matches('/').trim_end_matches(".git");
    if path.is_empty() {
        return None;
    }

    if let Some((_, rest)) = path.split_once("://") {
        if let Some((_, after_host)) = rest.split_once('/') {
            path = after_host;
        }
    } else if let Some((_, after_colon)) = path.split_once(':') {
        path = after_colon;
    }

    let parts = path
        .split('/')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>();
    if parts.len() >= 2 {
        return Some(parts[parts.len() - 2..].join("/"));
    }

    parts.last().map(|part| (*part).to_string())
}

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use super::*;

    struct TempProject {
        path: PathBuf,
    }

    impl TempProject {
        fn new(name: &str) -> Self {
            let id = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("time should be valid")
                .as_nanos();
            let path = std::env::temp_dir().join(format!("codenest-{name}-{id}"));
            fs::create_dir_all(&path).expect("temp project should be created");
            Self { path }
        }

        fn init_git(&self, config: &str) {
            let git_dir = self.path.join(".git");
            fs::create_dir_all(&git_dir).expect("git dir should be created");
            fs::write(git_dir.join("config"), config).expect("git config should be written");
        }
    }

    impl Drop for TempProject {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    fn detect_project_kind(path: &Path) -> Option<DetectedProjectKind> {
        detect_project_git_metadata(path).map(|metadata| metadata.kind)
    }

    #[test]
    fn detects_git_project() {
        let project = TempProject::new("git-project");
        project.init_git("");

        assert!(is_git_project(&project.path));
    }

    #[test]
    fn detects_clone_from_origin_remote() {
        let project = TempProject::new("clone");
        project.init_git(
            r#"
[remote "origin"]
  url = https://example.com/demo/repo.git
"#,
        );

        assert_eq!(
            detect_project_kind(&project.path),
            Some(DetectedProjectKind::Clone)
        );
    }

    #[test]
    fn extracts_source_metadata_from_origin_remote() {
        let project = TempProject::new("origin-source");
        project.init_git(
            r#"
[remote "origin"]
  url = git@github.com:owner/repo.git
"#,
        );

        assert_eq!(
            detect_project_git_metadata(&project.path),
            Some(ProjectGitMetadata {
                kind: DetectedProjectKind::Clone,
                from_url: Some("git@github.com:owner/repo.git".to_string()),
                from_name: Some("owner/repo".to_string()),
            })
        );
    }

    #[test]
    fn detects_fork_when_upstream_remote_exists() {
        let project = TempProject::new("fork");
        project.init_git(
            r#"
[remote "origin"]
  url = https://example.com/me/repo.git
[remote "upstream"]
  url = https://example.com/source/repo.git
"#,
        );

        assert_eq!(
            detect_project_kind(&project.path),
            Some(DetectedProjectKind::Fork)
        );
    }

    #[test]
    fn prefers_upstream_as_fork_source() {
        let project = TempProject::new("fork-source");
        project.init_git(
            r#"
[remote "origin"]
  url = https://github.com/me/repo.git
[remote "upstream"]
  url = https://github.com/source/repo.git
"#,
        );

        assert_eq!(
            detect_project_git_metadata(&project.path),
            Some(ProjectGitMetadata {
                kind: DetectedProjectKind::Fork,
                from_url: Some("https://github.com/source/repo.git".to_string()),
                from_name: Some("source/repo".to_string()),
            })
        );
    }
}
