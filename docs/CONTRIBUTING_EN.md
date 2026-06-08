# Contributing Guide

Thank you for considering contributing to the CodeNest project! Please read the following guide to help you get started with development smoothly.

## Setting Up the Development Environment

Ensure that [Node.js](https://nodejs.org/), [pnpm](https://pnpm.io/), and [Rust](https://www.rust-lang.org/tools/install) are installed on your local machine.

## Installing Dependencies

```bash
# Install dependencies
pnpm install

# Run the desktop development environment
pnpm dev
```

## Project Structure

```
CodeNest
  ├── .github     # GitHub Actions workflows
  ├── docs        # Documentation and screenshots
  ├── icons       # Icon source files
  ├── scripts     # Automation scripts
  ├── src         # Vue app source code
  ├── src-tauri   # Tauri desktop shell and native commands
  ├── tests       # Frontend unit tests
```

## Building the Project

```bash
# Run lint, type checks, and tests
pnpm check

# Build the Tauri executable without installers
pnpm build:exe

# Build platform bundles/installers
pnpm build
```

Build outputs are written to `src-tauri/target/release` and `src-tauri/target/release/bundle`.

## Contributions

### Branch Strategy

#### Main Branches

- **main**: Used for bug fixes, new feature development, performance improvements, or changes to internationalization (i18n) files.

#### Temporary Branches

- **feat/**: Branch used for submitting new features.
- **doc/**: Branch specifically for fixing documentation, without any code changes.
- **fix/**: Branch used for fixing bugs found in the `dev` branch.

### Commit Message Conventions

You can refer to the [Angular commit message guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Changes that do not affect the code’s meaning (e.g., formatting, missing semicolons)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Changes to the build process or tooling
- `perf`: Performance improvements
- `ci`: Continuous integration/delivery changes

You are also welcome to add a scope and footer, for example:
```
fix(dock): xxx
Description of changes
Related PR: url
```

### i18n

- When translating, if you come across a language you are unfamiliar with, you can refer to another language that you have already translated and note in the PR which language you couldn't translate.

- **Please manually maintain i18n files!!!** Do not use `i18n Ally` or other extensions to manage them. Using `i18n Ally` may lead to issues with translation placement or code comment deletions.
