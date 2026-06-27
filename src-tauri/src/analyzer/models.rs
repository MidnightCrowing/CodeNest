use std::collections::BTreeMap;

use serde::Serialize;

#[derive(Clone, Copy, Eq, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum LanguageType {
    Data,
    Markup,
    Programming,
    Prose,
}

#[derive(Clone, Default, Serialize)]
pub struct LineCounts {
    pub total: u64,
    pub content: u64,
    pub code: u64,
}

impl LineCounts {
    pub(super) fn add(&mut self, other: &LineCounts) {
        self.total += other.total;
        self.content += other.content;
        self.code += other.code;
    }
}

#[derive(Clone, Serialize)]
pub struct LanguageStats {
    pub bytes: u64,
    pub lines: LineCounts,
    #[serde(rename = "type")]
    pub language_type: LanguageType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
}

#[derive(Default, Serialize)]
pub struct FilesResult {
    pub count: u64,
    pub bytes: u64,
    pub lines: LineCounts,
    pub results: BTreeMap<String, Option<String>>,
    pub alternatives: BTreeMap<String, Vec<Option<String>>>,
}

#[derive(Default, Serialize)]
pub struct LanguagesResult {
    pub count: u64,
    pub bytes: u64,
    pub lines: LineCounts,
    pub results: BTreeMap<String, LanguageStats>,
}

#[derive(Default, Serialize)]
pub struct UnknownResult {
    pub count: u64,
    pub bytes: u64,
    pub lines: LineCounts,
    pub extensions: BTreeMap<String, u64>,
    pub filenames: BTreeMap<String, u64>,
}

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LinguistResult {
    pub files: FilesResult,
    pub languages: LanguagesResult,
    pub unknown: UnknownResult,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub main_language_override: Option<String>,
}
