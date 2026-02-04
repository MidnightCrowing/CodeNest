# Contributing Guide

Thank you for considering contributing to the CodeNest project! Please read the following guide to help you get started with development smoothly.

## Setting Up the Development Environment

Ensure that [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) are installed on your local machine.

## Installing Dependencies

```bash
# Install all dependencies (including component library)
pnpm install

# Build the component library
pnpm ui:build

# Run the project
pnpm dev
```

## Project Structure

```
CodeNest
  ├── data        # Stores user data and configuration files
  ├── electron    # Logic and configuration for Electron
  ├── icons       # Icons and resource files used by the project
  ├── jetv-ui     # Code and assets for the component library
  ├── scripts     # Scripts for automating tasks
  ├── src         # Source code and core logic of the Vue app
```

## Building the Project

```bash
# Build the project
pnpm build
```

You can find the built installation packages and extracted software in the `build` directory.

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
