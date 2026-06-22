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
                if raw_path.contains('$')
                    || raw_path.contains("light-edit")
                    || raw_path.contains("scratches")
                {
                    continue;
                }
                let normalized = normalize_jetbrains_path(raw_path, &home);
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
