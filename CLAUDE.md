# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeNest is a cross-platform desktop application for managing local project directories. Built with Tauri 2.x (Rust backend) + Vue 3 (frontend), it helps developers centralize scattered projects with features like language analysis, IDE launching, project scanning, and WebDAV sync.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (runs both Tauri and Vue dev servers)
pnpm dev

# Run all checks (lint, typecheck, tests)
pnpm check

# Linting
pnpm lint          # Check for issues
pnpm lint:fix      # Auto-fix issues

# Type checking
pnpm typecheck     # Vue/TypeScript

# Tests
pnpm test          # Frontend unit tests (Vitest)
pnpm test:rust     # Rust tests

# Build
pnpm build:exe     # Build executable only (no installer)
pnpm build         # Build with platform installer (CI mode)
pnpm build:vue     # Build Vue frontend only
```

## Architecture

### Stack
- **Frontend**: Vue 3 (Composition API) + Pinia (state) + Reka UI (components) + UnoCSS (styles) + vue-i18n (i18n)
- **Backend**: Tauri 2.x (Rust) with custom commands for filesystem, language analysis, project scanning, and system integration
- **Build**: Vite (frontend bundler), pnpm (package manager)

### Key Directories
- `src/` — Vue 3 frontend application
  - `views/` — Main views (HomeView, ProjectEditorView, SettingsView)
  - `stores/` — Pinia stores (projectsStore, settingsStore, projectScannerStore, editorLangGroupsStore)
  - `services/` — Business logic (projectScannerService, languageAnalyzer, licenseDetector)
  - `components/` — Reusable Vue components
  - `constants/` — Enums, types, editor configs
  - `locales/` — i18n translation files (zh-CN, en)
  - `desktop/api.ts` — Type-safe wrapper for Tauri commands
- `src-tauri/` — Rust backend
  - `src/lib.rs` — Command registration
  - `src/*.rs` — Command modules (project, scanner, data, webdav, system, etc.)
  - `tauri.conf.json` — Tauri app configuration
  - `Cargo.toml` — Rust dependencies
- `tests/` — Frontend unit tests (Vitest)

### Data Flow
1. **Frontend state** (Pinia stores) loads from localStorage cache immediately for fast startup
2. **Tauri commands** load persistent JSON files from app data directory asynchronously
3. **Stores sync** state to both localStorage (cache) and disk (via Tauri commands)
4. **Data files** stored in OS-specific app data directory with automatic backup on write

### Core Data Files
Managed by `src-tauri/src/data.rs` and `src/stores/helpers/persistence.ts`:
- `projects.json` — Project list
- `settings.json` — User settings (theme, language, IDE paths, scanner config, WebDAV)
- `language-editor-map.json` — Language-to-editor mappings
- `projects.scanner.json` — Scanner cache (scanned paths, project metadata)

WebDAV passwords stored separately in OS secure storage (keyring) when available.

## Key Features & Implementation

### Project Scanning
- **Root scanning**: Recursively scans user-specified directories for projects
- **IDE history**: Imports from JetBrains config, VS Code/Cursor/Windsurf/Trae state.vscdb, Claude Code/Codex/Gemini CLI history
- **Language analysis**: Uses linguist-style detection (implemented in `src-tauri/src/analyzer.rs`)
- **Caching**: Scans are cached by directory signature (file count, sizes, modification times) to avoid re-analysis
- **Implementation**: `src-tauri/src/scanner.rs` + `src/services/projectScannerService.ts`

### IDE/Editor Integration
- **Launch commands**: Configurable per editor with `{project}` and `{cwd}` placeholders
- **Auto-detection**: Rust code detects installed editors on Windows/macOS/Linux
- **Terminal mode**: Some editors (Neovim, CLI tools) open in terminal instead of GUI
- **Default editor per project**: Can be set manually or auto-selected by language
- **Supported editors**: JetBrains IDEs, VS Code, Cursor, Windsurf, Trae, Zed, Sublime Text, Neovim, Claude Code, Codex CLI, Gemini CLI, Android Studio, Visual Studio
- **Implementation**: `src-tauri/src/project.rs` (detection/launch) + `src/constants/codeEditor.ts` (editor metadata)

### Language Analysis
- Analyzes project files to determine language distribution
- Prioritizes programming languages > markup > data > prose
- Detects main language and generates percentage breakdown
- **Implementation**: `src-tauri/src/analyzer.rs` + linguist data in `src/types/linguist.ts`

### License Detection
- Scans project root for LICENSE*/COPYING* files
- Detects common licenses (MIT, Apache 2.0, GPL-3.0, GPL-2.0, BSD, ISC, Mozilla, etc.)
- Uses keyword matching with scoring
- **Implementation**: `src/services/licenseDetector.ts` + `src-tauri/src/project.rs::read_project_license`

### WebDAV Sync
- Manual upload/download of settings and project list to WebDAV server
- Creates local backup before download
- Preserves local WebDAV credentials (not synced to remote)
- **Implementation**: `src-tauri/src/webdav.rs`

## Frontend Patterns

### Component Structure
- **Single File Components** with `<script lang="ts" setup>` (Composition API)
- **Auto-imports**: Vue APIs, Pinia stores via `unplugin-auto-import`
- **Path alias**: `~/` resolves to `src/`
- **Component size limit**: Files over ~200 lines should be refactored into smaller modules
- **Component organization**: Views use a `components/` subdirectory for view-specific components, with a `shared/` folder for reusable sub-components

### Component Refactoring Pattern
When refactoring large view components (like HomeView, ProjectEditorView):
1. **Extract shared components first** (bottom-up): Create small, reusable components in `shared/` folder
2. **Then extract view-specific components**: List items, cards, sections that use the shared components
3. **Finally extract container components**: View containers that compose the smaller components
4. **Main view becomes orchestrator**: Keep only composables integration, global state, lifecycle hooks, and layout

Example structure (HomeView refactored from 2,142 → 1,045 lines):
```
views/HomeView/
├── HomeView.vue              (main container ~1000 lines)
├── components/               (view-specific components)
│   ├── HomeHeader.vue
│   ├── HomeFilterBar.vue
│   ├── ProjectListView.vue
│   ├── ProjectListItem.vue
│   ├── ProjectGridView.vue
│   ├── ProjectCard.vue
│   └── shared/              (reusable sub-components)
│       ├── ProjectActions.vue
│       ├── ProjectHeader.vue
│       ├── ProjectMeta.vue
│       └── ProjectEditorChip.vue
└── composables/             (logic, keep unchanged during refactor)
```

### State Management
- **Pinia stores** follow pattern: reactive state + computed + async load/save
- **Dual persistence**: localStorage (cache) + Tauri commands (disk)
- **Load sequence**: hydrate from cache → load from disk → save sanitized data
- **Normalization**: Path normalization for cross-platform consistency (Windows verbatim prefix stripping, case handling)

### Styling
- **UnoCSS** with custom shortcuts and presets (Wind3, attributify, icons, typography)
- **Attributify mode preferred**: Use `flex="~ items-center gap-3"` instead of `class="flex items-center gap-3"`
- **Minimize CSS classes**: Only use class names for component-specific identifiers
- **SCSS usage**: Reserve for complex scenarios only (animations, transitions, pseudo-elements, media queries, deep selectors)
- **Custom icons** via `presetIcons` and `src/assets/icons.json`
- **Theme system**: Light/dark/system with custom accent colors
- **Shortcuts defined** in `unocss.config.ts`

**Styling example**:
```vue
<template>
  <!-- Good: UnoCSS attributify -->
  <div
    flex="~ col gap-3"
    p="x-4 y-3"
    bg="white dark:gray-9"
    border="1 solid gray-3 rounded-2"
    class="project-card"
  />
</template>

<style lang="scss" scoped>
// Only for complex logic
.project-card {
  transition: all 180ms ease;

  &:hover {
    @apply shadow-$shadow-surface-hover;
    transform: translateY(-1px);
  }
}
</style>
```

### i18n
- **vue-i18n** with Simplified Chinese (zh-CN) and English (en)
- **Translation files**: `src/locales/`
- **Manual maintenance required**: Do NOT use i18n Ally extension (causes placement issues)

## Backend Patterns

### Tauri Commands
- All commands registered in `src-tauri/src/lib.rs::run()`
- Commands organized by module (project, scanner, data, system, etc.)
- Use `#[tauri::command]` attribute
- Return `Result<T, String>` or custom result types with `success: bool` field

### File Safety
- **Atomic writes**: Write to `.tmp` → validate → backup original → replace
- **Backup recovery**: If write fails, restore from `.bak`
- **JSON validation**: Parse before write, parse after write
- **Implementation**: `src-tauri/src/data.rs::write_data_file_safely`

### Path Handling
- **Cross-platform**: Use `Path`/`PathBuf` from `std::path`
- **Display paths**: Strip Windows verbatim prefix (`\\?\`) for display
- **Normalization**: Lowercase on Windows, preserve case on Unix for comparison

### Concurrency
- **Async runtime**: Use `tauri::async_runtime::spawn_blocking` for CPU-bound work
- **Project existence checks**: Run concurrently with limit (12 concurrent checks)

## Testing

### Frontend Tests
- **Framework**: Vitest
- **Test files**: `tests/*.test.ts`
- **Run**: `pnpm test`
- **Coverage**: License detection, store persistence, locale key validation

### Rust Tests
- **Framework**: Standard Rust `#[test]` + `#[cfg(test)]`
- **Test files**: Inline in source files (e.g., `src-tauri/src/data.rs`)
- **Run**: `pnpm test:rust` or `cargo test --manifest-path src-tauri/Cargo.toml`

## Commits & PRs

- Follow Angular commit conventions (feat:, fix:, docs:, style:, refactor:, test:, chore:, perf:, ci:)
- Branch strategy: `main` for stable releases, temporary branches `feat/`, `fix/`, `doc/`
- No interactive git flags (`git rebase -i`, `git add -i`) in this environment

## Important Notes

- **Platform differences**: macOS uses native title bar, Windows/Linux use custom decorations
- **Pre-commit hook**: Runs `pnpm lint-staged` to lint all changed files
- **Build optimization**: Release builds use `opt-level = "z"`, LTO, strip for smaller binaries
- **i18n maintenance**: Do NOT use i18n Ally extension, manually maintain translation files
- **WebDAV password**: Stored in OS keyring when available, falls back to settings.json for unsupported systems
- **Code size limit**: Files over a few hundred lines must be refactored into smaller modules (see Component Refactoring Pattern)
- **Component architecture**: Props down, events up; use shared components for reusability
- **Performance priority**: Lower memory is wanted, but never at the cost of runtime performance
