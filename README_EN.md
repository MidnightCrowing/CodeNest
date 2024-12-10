# CodeNest

[简体中文](README.md) | English

![Interface](/docs/source/Interface_EN.png)

## Introduction

CodeNest is a local project management tool that helps organize projects scattered across different locations on your disk. It allows you to manage projects by categories such as "My Projects," "Forks," "Clones," or "Temporary Projects," and it can analyze the programming languages of projects (similar to GitHub). This makes it easier to open projects with your IDE.

## Installation

1. Go to the [Releases](https://github.com/MidnightCrowing/CodeNest/releases) page and download the installation package suitable for your system. After downloading, extract the files and follow the installation instructions to start using CodeNest.

2. You can also find installation packages built with the latest code in the [CI](https://github.com/MidnightCrowing/CodeNest/actions) page. Note that you need to be logged into your GitHub account to download these files.

## Usage Guide

### 1. Add a Project

Click the "Add Project" button on the main interface of CodeNest, fill in the necessary information, and click "Add" to add the project to the list.

### 2. Filter Projects

Use the search box in the top right corner to enter keywords or use the filter options to select a specific programming language to quickly find the desired project.

### 3. Analyze Project Language

CodeNest will automatically detect and display the main programming language for each project, which will appear in the language list, making it easier to filter and manage projects by language.

### 4. Open a Project with an IDE

Click the "Open" button next to a project in the project list, and CodeNest will launch the configured IDE and open the project directly.

> ![NOTE]
> If the IDE path is not configured, please complete the configuration in the "Settings" page first.

### 5. Mark Temporary Projects

For projects used temporarily, you can select "Edit" from the project menu and mark them as "Temporary Projects" in the pop-up window. These projects will be automatically placed into the "Temporary Projects" category for easy management.

### 6. Delete a Project

Select "Delete" from the project menu to remove the project from the list.

> ![CAUTION]
> Deleting temporary projects will also remove their local files. Please ensure you are certain before proceeding.

## Feedback

If you have any questions or suggestions, please visit the [GitHub Issues page of this project](https://github.com/MidnightCrowing/CodeNest/issues) to submit feedback.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing and Building the Project

See [CONTRIBUTING.md](docs/CONTRIBUTING_EN.md) for more information.

## Acknowledgments

Special thanks to the open-source community and all the developers who have contributed to this project!
