# CodeNest

简体中文 | [English](README_EN.md)

<p align="center" style="margin-bottom: 0 !important;">
<img width="600" alt="CodeNest 界面截图" src="https://raw.githubusercontent.com/MidnightCrowing/CodeNest/main/docs/source/Interface_CN.png"><br/>
</p>

## 简介

CodeNest 是一款跨平台本地项目管理工具，用来集中整理分散在磁盘各处的项目。它支持项目分类、语言统计、IDE/CLI 打开命令、扫描导入、WebDAV 手动同步，以及项目置顶等日常管理功能。

## 主要功能

- 项目列表与卡片视图，支持搜索、分类、状态、语言、分组和排序筛选。
- 项目类型：个人、Fork、Clone、临时项目。
- 语言占比分析和主语言筛选。
- IDE/CLI 打开命令配置，支持 JetBrains、Visual Studio Code、Cursor、Windsurf、Trae、Zed、Codex CLI、Claude Code、Gemini CLI 等。
- 扫描器可从项目根目录、JetBrains 配置和 VS Code 历史记录中导入项目。
- WebDAV 手动上传/下载设置与项目列表，下载前会创建本地备份。
- 置顶项目、右键菜单、键盘导航和安全的数据读写备份。
- 支持亮色/暗色主题、系统/自定义主题色和中英文界面。

## 安装

前往 [Releases](https://github.com/MidnightCrowing/CodeNest/releases) 下载适合系统的安装包。

Windows 版本默认发布 NSIS 安装包；macOS 和 Linux 构建产物由 GitHub Actions 按平台生成。

也可以在 [Actions](https://github.com/MidnightCrowing/CodeNest/actions) 页面下载最新代码构建产物。下载 Actions 产物需要登录 GitHub。

## 使用说明

### 添加项目

点击“添加项目”，选择项目文件夹并填写名称、类型、来源、主语言、打开方式等信息。

### 打开项目

在列表或卡片中点击打开按钮。首次使用前建议在“设置 > IDE”中确认各编辑器命令。

### 扫描项目

在“设置 > 扫描器”启用目录扫描或 IDE 历史导入，然后回到首页点击扫描按钮。未启用扫描器时首页不会显示扫描按钮。

### 同步数据

在“设置 > 数据”填写 WebDAV 服务器、目录、账号和密码，可手动测试连接、上传到云端或从云端下载。下载会先备份本地数据。

### 键盘操作

- `Tab` / `Shift+Tab`：在主要控件之间移动焦点。
- 方向键：在项目列表、卡片和操作按钮组中移动焦点。
- `Enter` / `Space`：打开当前项目或触发当前按钮。
- `Shift+F10` / 菜单键：打开项目更多菜单。

## 开发

```bash
pnpm install
pnpm dev
```

常用检查和构建命令：

```bash
pnpm check
pnpm build:exe
pnpm build
```

`pnpm build:exe` 只构建 Tauri 可执行文件，不生成安装包；`pnpm build` 会生成平台安装包。

## 贡献与构建

查看 [CONTRIBUTING.md](docs/CONTRIBUTING_CN.md)。

## 反馈

如有问题或建议，请在 [GitHub Issues](https://github.com/MidnightCrowing/CodeNest/issues) 提交。

## 许可证

本项目使用 [MIT 许可证](LICENSE.txt)。

## 鸣谢

- [Tauri](https://tauri.app/)
- [Vue](https://vuejs.org/)
- [Reka UI](https://reka-ui.com/)
- [UnoCSS](https://unocss.dev/)
- [Lucide](https://lucide.dev/)
- [Iconify](https://iconify.design/)
- JetBrains、Visual Studio Code、Cursor、Windsurf、Trae、Zed、Codex、Claude、Gemini 等编辑器/工具的品牌图标资源
