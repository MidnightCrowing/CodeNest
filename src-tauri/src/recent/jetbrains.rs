use std::{fs, path::Path};

use super::{common::uniq_existing_dirs, models::RecentProject};

pub fn collect_from_jetbrains(config_root: Option<&str>) -> Vec<RecentProject> {
    let Some(config_root) = config_root.filter(|path| !path.is_empty()) else {
        return Vec::new();
    };
    let root = Path::new(config_root);
    if !root.is_dir() {
        return Vec::new();
    }

    let mut candidates = Vec::new();
    let home = dirs::home_dir().unwrap_or_default();
    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(_) => return Vec::new(),
    };

    for entry in entries.flatten() {
        let product_dir = entry.path();
        if !product_dir.is_dir() {
            continue;
        }

        let xml_path = product_dir.join("options").join("recentProjects.xml");
        let Ok(xml) = fs::read_to_string(xml_path) else {
            continue;
        };
        let Ok(document) = roxmltree::Document::parse(&xml) else {
            continue;
        };

        let ide = entry
            .file_name()
            .to_string_lossy()
            .split(char::is_numeric)
            .next()
            .and_then(map_jetbrains_ide);

        for option in document.descendants().filter(|node| {
            node.has_tag_name("option") && node.attribute("name") == Some("additionalInfo")
        }) {
            for project_entry in option
                .descendants()
                .filter(|node| node.has_tag_name("entry"))
            {
                let Some(raw_path) = project_entry.attribute("key") else {
                    continue;
                };
                // light-edit / scratches are transient JetBrains workspaces.
                // Expand $USER_HOME$ first, then drop any still-unresolved macros.
                if raw_path.contains("light-edit") || raw_path.contains("scratches") {
                    continue;
                }
                let normalized = normalize_jetbrains_path(raw_path, &home);
                if normalized.contains('$') {
                    continue;
                }
                candidates.push(RecentProject {
                    path: normalized,
                    ide: ide.clone(),
                });
            }
        }
    }

    uniq_existing_dirs(candidates)
}

fn normalize_jetbrains_path(raw_path: &str, home: &Path) -> String {
    let with_home = raw_path.replace("$USER_HOME$", &home.to_string_lossy());
    if cfg!(windows) {
        with_home.replace('/', "\\")
    } else {
        with_home
    }
}

fn map_jetbrains_ide(raw_name: &str) -> Option<String> {
    let value = match raw_name {
        "IntelliJIdea" => "intellij-idea",
        "PyCharm" => "pycharm",
        "PhpStorm" => "phpstorm",
        "GoLand" => "goLand",
        "Rider" => "rider",
        "CLion" => "clion",
        "RustRover" => "rust-rover",
        "WebStorm" => "webstorm",
        "RubyMine" => "rubymine",
        "AndroidStudio" => "android-studio",
        _ => return None,
    };
    Some(value.to_string())
}

#[cfg(test)]
mod tests {
    use std::{
        fs,
        path::Path,
        time::{SystemTime, UNIX_EPOCH},
    };

    use crate::analyzer::normalize_path_key;

    use super::{collect_from_jetbrains, map_jetbrains_ide, normalize_jetbrains_path};

    fn unique_temp_dir(label: &str) -> std::path::PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be valid")
            .as_nanos();
        std::env::temp_dir().join(format!(
            "codenest-jetbrains-{label}-{}-{unique}",
            std::process::id()
        ))
    }

    fn write_recent_projects_xml(product_dir: &Path, entries: &[&str]) {
        let options_dir = product_dir.join("options");
        fs::create_dir_all(&options_dir).expect("options dir should be created");
        let mut body = String::from(
            r#"<application><component name="RecentProjectsManager"><option name="additionalInfo"><map>"#,
        );
        for entry in entries {
            body.push_str(&format!(r#"<entry key="{entry}"/>"#));
        }
        body.push_str("</map></option></component></application>");
        fs::write(options_dir.join("recentProjects.xml"), body)
            .expect("recentProjects.xml should be written");
    }

    #[test]
    fn collect_from_jetbrains_returns_empty_for_missing_root() {
        assert!(collect_from_jetbrains(None).is_empty());
        assert!(collect_from_jetbrains(Some("")).is_empty());
        assert!(collect_from_jetbrains(Some(
            r"E:\definitely-missing-jetbrains-config-root"
        ))
        .is_empty());
    }

    #[test]
    fn map_jetbrains_ide_recognizes_common_products() {
        assert_eq!(
            map_jetbrains_ide("IntelliJIdea").as_deref(),
            Some("intellij-idea")
        );
        assert_eq!(map_jetbrains_ide("WebStorm").as_deref(), Some("webstorm"));
        assert_eq!(map_jetbrains_ide("GoLand").as_deref(), Some("goLand"));
        assert_eq!(map_jetbrains_ide("UnknownIde"), None);
    }

    #[test]
    fn normalize_jetbrains_path_expands_user_home() {
        let home = Path::new(r"C:\Users\example");
        let normalized = normalize_jetbrains_path("$USER_HOME$/Projects/CodeNest", home);
        #[cfg(windows)]
        assert_eq!(normalized, r"C:\Users\example\Projects\CodeNest");
        #[cfg(not(windows))]
        assert_eq!(normalized, "C:\\Users\\example/Projects/CodeNest");
    }

    #[test]
    fn collect_from_jetbrains_reads_existing_projects_and_skips_transients() {
        let root = unique_temp_dir("collect");
        let config_root = root.join("config");
        let project = root.join("project_a");
        fs::create_dir_all(&project).expect("project dir should be created");
        fs::create_dir_all(&config_root).expect("config root should be created");

        let product_dir = config_root.join("WebStorm2024.1");
        let project_key = project.to_string_lossy().replace('\\', "/");
        write_recent_projects_xml(
            &product_dir,
            &[
                project_key.as_str(),
                "$USER_HOME$/light-edit",
                "/tmp/scratches/demo",
                "$APPLICATION_CONFIG_DIR$/system",
            ],
        );

        let items = collect_from_jetbrains(Some(&config_root.to_string_lossy()));
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].ide.as_deref(), Some("webstorm"));
        assert_eq!(
            normalize_path_key(Path::new(&items[0].path)),
            normalize_path_key(&project)
        );

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn collect_from_jetbrains_expands_user_home_macro() {
        let home = dirs::home_dir().expect("home dir should exist for jetbrains macro test");
        let project = home.join(format!(
            "codenest-jetbrains-home-project-{}-{}",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system time should be valid")
                .as_nanos()
        ));
        fs::create_dir_all(&project).expect("home project dir should be created");

        let root = unique_temp_dir("home-macro");
        let config_root = root.join("config");
        fs::create_dir_all(&config_root).expect("config root should be created");
        let product_dir = config_root.join("IntelliJIdea2023.3");
        let relative = project
            .strip_prefix(&home)
            .expect("project should be under home")
            .to_string_lossy()
            .replace('\\', "/");
        write_recent_projects_xml(
            &product_dir,
            &[&format!("$USER_HOME$/{relative}")],
        );

        let items = collect_from_jetbrains(Some(&config_root.to_string_lossy()));
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].ide.as_deref(), Some("intellij-idea"));
        assert_eq!(
            normalize_path_key(Path::new(&items[0].path)),
            normalize_path_key(&project)
        );

        let _ = fs::remove_dir_all(project);
        let _ = fs::remove_dir_all(root);
    }
}
