<div align="center">

# CodeNest

A modern desktop application for managing development projects

[![License](https://img.shields.io/github/license/MidnightCrowing/CodeNest?style=flat-square)](LICENSE.txt)
[![Release](https://img.shields.io/github/v/release/MidnightCrowing/CodeNest?style=flat-square)](https://github.com/MidnightCrowing/CodeNest/releases)
[![Downloads](https://img.shields.io/github/downloads/MidnightCrowing/CodeNest/total?style=flat-square)](https://github.com/MidnightCrowing/CodeNest/releases)

English · <a href="README.md">简体中文</a>

<img src="https://raw.githubusercontent.com/MidnightCrowing/CodeNest/main/docs/source/Interface_EN.png" alt="CodeNest Interface" width="800" />

</div>

---

## Overview

CodeNest helps developers centralize and manage projects scattered across their disk. Whether personal projects, open source contributions, or temporary experiments, organize and access them all from a unified interface.

Built on Tauri 2.0 and Vue 3, delivering native performance with a modern user experience.

## Key Features

### Smart Project Scanner
Automatically import projects from VS Code, JetBrains IDEs, Claude Code and other tools' history, or scan specified directories to detect project structures.

### Language Analysis
Powered by Linguist's language detection engine, automatically analyze project language composition with support for filtering and grouping by language.

### Multi-IDE Integration
Pre-configured for 20+ mainstream editors and CLI tools with customizable command templates, open projects in your preferred tool with one click.

### Flexible Views
List view provides compact information density, card view shows more project details. Virtual scrolling ensures smooth performance with large project collections.

### WebDAV Sync
Manually upload or download project data to WebDAV servers, with automatic local backup before downloads to ensure data safety.

### Keyboard-First
Full keyboard navigation support, complete all operations without touching the mouse.

## Installation

Download the installer for your system from the [Releases](https://github.com/MidnightCrowing/CodeNest/releases) page.

<table>
<thead>
<tr>
<th>Operating System</th>
<th>Minimum Version</th>
<th>Architecture</th>
<th>Package Format</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Windows</strong></td>
<td>Windows 10</td>
<td>x64</td>
<td>MSI</td>
</tr>
<tr>
<td><strong>macOS</strong></td>
<td>macOS 11 (Big Sur)</td>
<td>Intel / Apple Silicon</td>
<td>DMG</td>
</tr>
<tr>
<td><strong>Linux</strong></td>
<td>Ubuntu 20.04 / Fedora 36</td>
<td>x64</td>
<td>AppImage / deb / rpm</td>
</tr>
</tbody>
</table>

## Quick Start

### Add a Project
Click "Add project" button and select a project directory. The app automatically detects language and license. You can manually set project type, source repository and default editor.

### Batch Import
Navigate to "Settings > Scanner", configure directories to scan or enable IDE history import, then return to home and click the scan button to batch add projects.

### Open Project
Click project cards directly or use action bar buttons:
- Open in specified IDE
- Show in file manager
- Open in terminal
- Copy project path

### Data Sync
Configure WebDAV server information in "Settings > Data" to sync project lists and configurations across devices.

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- **Vue 3** - Composition API
- **Pinia** - State management
- **Reka UI** - Unstyled component library
- **UnoCSS** - Atomic CSS
- **Vite** - Build tool
- **vue-i18n** - Internationalization

</td>
<td valign="top" width="50%">

### Backend
- **Tauri 2.0** - App framework
- **Rust** - Systems programming language
- Native system integration
- Secure file operations
- WebDAV client
- Password encryption

</td>
</tr>
</table>

## Development

### Requirements
- Node.js 18+
- Rust 1.70+
- pnpm 8+

### Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run all checks
pnpm check

# Build application
pnpm build:exe    # Executable only
pnpm build        # With installer
```

### Project Structure

```
codenest/
├── src/              # Vue frontend
│   ├── views/        # Page components
│   ├── stores/       # Pinia state
│   ├── components/   # Reusable components
│   └── services/     # Business logic
├── src-tauri/        # Rust backend
│   └── src/          # Tauri commands
└── tests/            # Test files
```

For more development guidance, see [CLAUDE.md](CLAUDE.md) and [CONTRIBUTING.md](docs/CONTRIBUTING_EN.md).

## Keyboard Shortcuts

<table>
<thead>
<tr>
<th width="30%">Action</th>
<th width="35%">Shortcut</th>
<th width="35%">Scope</th>
</tr>
</thead>
<tbody>
<tr>
<td>Open project</td>
<td><kbd>Enter</kbd> / <kbd>Space</kbd></td>
<td>Project focus</td>
</tr>
<tr>
<td>Edit project</td>
<td><kbd>Ctrl</kbd>+<kbd>I</kbd> / <kbd>⌘</kbd>+<kbd>I</kbd></td>
<td>Project focus</td>
</tr>
<tr>
<td>Copy path</td>
<td><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>⌘</kbd>+<kbd>C</kbd></td>
<td>Project focus</td>
</tr>
<tr>
<td>Delete project</td>
<td><kbd>Delete</kbd> / <kbd>Backspace</kbd></td>
<td>Project focus</td>
</tr>
<tr>
<td>More menu</td>
<td><kbd>Shift</kbd>+<kbd>F10</kbd></td>
<td>Project focus</td>
</tr>
<tr>
<td>Navigation</td>
<td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td>
<td>List/Card/Actions</td>
</tr>
</tbody>
</table>

## Feedback & Contributing

Report issues or suggest features via [GitHub Issues](https://github.com/MidnightCrowing/CodeNest/issues).

If you'd like to contribute code, please read the [Contributing Guide](docs/CONTRIBUTING_EN.md) first.

## License

[MIT License](LICENSE.txt) © 2024 MidnightCrowing

## Acknowledgments

This project uses the following excellent open source projects:

- [Tauri](https://tauri.app/) - Cross-platform desktop app framework
- [Vue](https://vuejs.org/) - Progressive JavaScript framework
- [Reka UI](https://reka-ui.com/) - Unstyled component library
- [UnoCSS](https://unocss.dev/) - Instant on-demand atomic CSS engine
- [Lucide](https://lucide.dev/) - Beautiful open source icon library

And editor icon resources provided by JetBrains, Microsoft, Anthropic and others.
