use std::{
    fs,
    path::{Path, PathBuf},
};

use super::models::DetectedProjectKind;

pub(super) fn is_git_project(path: &Path) -> bool {
    path.join(".git").exists()
}

pub(super) fn detect_project_kind(path: &Path) -> Option<DetectedProjectKind> {
    let git_config = find_git_config(path)?;
    let config = fs::read_to_string(git_config).ok()?;

    let mut has_origin = false;
    let mut has_upstream = false;
    for remote in parse_remotes(&config) {
        match remote.as_str() {
            "upstream" => has_upstream = true,
            "origin" => has_origin = true,
            _ => {}
        }
    }

    Some(if has_upstream {
        DetectedProjectKind::Fork
    } else if has_origin {
        DetectedProjectKind::Clone
    } else {
        DetectedProjectKind::Mine
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

fn parse_remotes(config: &str) -> Vec<String> {
    config
        .lines()
        .filter_map(|line| parse_remote_section(line.trim()))
        .collect()
}

fn parse_remote_section(line: &str) -> Option<String> {
    let rest = line.strip_prefix("[remote ")?;
    let name = rest.trim().strip_prefix('"')?.strip_suffix("\"]")?;
    (!name.is_empty()).then(|| name.to_string())
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
}
