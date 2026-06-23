mod language;
mod models;
mod paths;
mod scan;

pub(crate) use language::language_color;
#[allow(unused_imports)]
pub use models::{
    FilesResult, LanguageStats, LanguageType, LanguagesResult, LineCounts, LinguistResult,
    UnknownResult,
};
#[allow(unused_imports)]
pub use paths::{
    canonical_or_original, display_path, normalize_path_key, strip_windows_verbatim_prefix,
};
pub use scan::{analyze_folder, is_skipped_dir, max_scan_bytes};
