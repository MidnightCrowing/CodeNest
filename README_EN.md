# CodeNest

[简体中文](README.md) | English

<p align="center" style="margin-bottom: 0 !important;">
<img width="600" alt="CodeNest interface screenshot" src="https://raw.githubusercontent.com/MidnightCrowing/CodeNest/main/docs/source/Interface_EN.png"><br/>
</p>

## Introduction

CodeNest is a cross-platform local project manager for organizing projects scattered across your disk. It supports project categories, language statistics, IDE/CLI launch commands, scanner imports, manual WebDAV sync, pinned projects, and daily project maintenance workflows.

## Features

- List and card views with search, kind, status, language, group, and sort filters.
- Project kinds: Mine, Fork, Clone, and Temporary.
- Language mix analysis and main language filtering.
- Configurable IDE/CLI launch commands for JetBrains IDEs, Visual Studio Code, Cursor, Windsurf, Trae, Zed, Codex CLI, Claude Code, Gemini CLI, and more.
- Scanner imports from project roots, JetBrains configuration, and VS Code history.
- Manual WebDAV upload/download for settings and project list data. Pulling from WebDAV creates a local backup first.
- Pinned projects, context menus, keyboard navigation, and safer data persistence with backups.
- Light/dark themes, system/custom accent colors, and English/Simplified Chinese UI.

## Installation

Download the installer for your platform from [Releases](https://github.com/MidnightCrowing/CodeNest/releases).

The Windows release publishes an NSIS installer by default. macOS and Linux artifacts are built by GitHub Actions for their platforms.

You can also download latest-code build artifacts from [Actions](https://github.com/MidnightCrowing/CodeNest/actions). Downloading Actions artifacts requires a GitHub account.

## Usage

### Add a Project

Click “Add project”, choose a project folder, then fill in its name, kind, source, main language, and launch editor.

### Open a Project

Click the open button in the list or card view. Before first use, check editor commands in “Settings > IDEs”.

### Scan Projects

Enable root scanning or IDE history imports in “Settings > Scanner”, then use the scan button on the home page. The scan button is hidden when the scanner is disabled.

### Sync Data

In “Settings > Data”, enter the WebDAV server, directory, account, and password. You can test the connection, upload to cloud, or download from cloud manually. Downloads create a local backup first.

### Keyboard

- `Tab` / `Shift+Tab`: move focus between primary controls.
- Arrow keys: move focus in project lists, cards, and action toolbars.
- `Enter` / `Space`: open the focused project or activate the focused button.
- `Shift+F10` / Menu key: open the project more menu.

## Development

```bash
pnpm install
pnpm dev
```

Common checks and builds:

```bash
pnpm check
pnpm build:exe
pnpm build
```

`pnpm build:exe` builds the Tauri executable without installers. `pnpm build` creates platform bundles/installers.

## Contributing and Building

See [CONTRIBUTING.md](docs/CONTRIBUTING_EN.md).

## Feedback

For questions or suggestions, open an issue in [GitHub Issues](https://github.com/MidnightCrowing/CodeNest/issues).

## License

This project is licensed under the [MIT License](LICENSE.txt).

## Acknowledgments

- [Tauri](https://tauri.app/)
- [Vue](https://vuejs.org/)
- [Reka UI](https://reka-ui.com/)
- [UnoCSS](https://unocss.dev/)
- [Lucide](https://lucide.dev/)
- [Iconify](https://iconify.design/)
- Brand icons from JetBrains, Visual Studio Code, Cursor, Windsurf, Trae, Zed, Codex, Claude, Gemini, and other editor/tool projects
