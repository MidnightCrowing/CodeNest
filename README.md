<div align="center">

# CodeNest

一款现代化的桌面应用，用于管理开发项目

[![License](https://img.shields.io/github/license/MidnightCrowing/CodeNest?style=flat-square)](LICENSE.txt)
[![Release](https://img.shields.io/github/v/release/MidnightCrowing/CodeNest?style=flat-square)](https://github.com/MidnightCrowing/CodeNest/releases)
[![Downloads](https://img.shields.io/github/downloads/MidnightCrowing/CodeNest/total?style=flat-square)](https://github.com/MidnightCrowing/CodeNest/releases)

<a href="README_EN.md">English</a> · 简体中文

<img src="https://raw.githubusercontent.com/MidnightCrowing/CodeNest/main/docs/source/Interface_CN.png" alt="CodeNest Interface" width="800" />

</div>

---

## 概述

CodeNest 帮助开发者集中管理分散在磁盘各处的项目。无论是个人项目、开源贡献还是临时实验，都可以在一个界面中统一组织、快速访问。

基于 Tauri 2.0 与 Vue 3 构建，提供原生性能与现代化的用户体验。

## 核心特性

### 智能项目扫描
自动从 VS Code、JetBrains IDE、Claude Code 等工具的历史记录中导入项目，或扫描指定目录识别项目结构。

### 语言分析
基于 Linguist 的语言识别引擎，自动分析项目语言构成，支持按语言筛选和分组。

### 多 IDE 集成
预置 20+ 主流编辑器和 CLI 工具的启动配置，支持自定义命令模板，一键在指定工具中打开项目。

### 灵活的视图
列表视图提供紧凑的信息密度，卡片视图展示更多项目细节。支持虚拟滚动，流畅处理大量项目。

### WebDAV 同步
手动上传或下载项目数据到 WebDAV 服务器，下载前自动备份本地数据，确保数据安全。

### 键盘优先
完整的键盘导航支持，无需鼠标即可完成所有操作。

## 安装

从 [Releases](https://github.com/MidnightCrowing/CodeNest/releases) 页面下载适合你系统的安装包。

<table>
<thead>
<tr>
<th>操作系统</th>
<th>最低版本</th>
<th>架构</th>
<th>安装包格式</th>
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

## 快速开始

### 添加项目
点击"添加项目"按钮，选择项目目录。应用会自动识别语言和许可证，你可以手动设置项目类型、来源仓库和默认编辑器。

### 批量导入
进入"设置 > 扫描器"，配置要扫描的目录或启用 IDE 历史导入，返回主页点击扫描按钮即可批量添加项目。

### 打开项目
直接点击项目卡片，或使用操作栏中的按钮：
- 在指定 IDE 中打开
- 在文件管理器中显示
- 在终端中打开
- 复制项目路径

### 数据同步
在"设置 > 数据"中配置 WebDAV 服务器信息，可以在不同设备间同步项目列表和配置。

## 技术栈

<table>
<tr>
<td valign="top" width="50%">

### 前端
- **Vue 3** - Composition API
- **Pinia** - 状态管理
- **Reka UI** - 无样式组件库
- **UnoCSS** - 原子化 CSS
- **Vite** - 构建工具
- **vue-i18n** - 国际化

</td>
<td valign="top" width="50%">

### 后端
- **Tauri 2.0** - 应用框架
- **Rust** - 系统编程语言
- 原生系统集成
- 安全的文件操作
- WebDAV 客户端
- 密码加密存储

</td>
</tr>
</table>

## 开发

### 环境要求
- Node.js 18+
- Rust 1.70+
- pnpm 8+

### 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行所有检查
pnpm check

# 构建应用
pnpm build:exe    # 仅可执行文件
pnpm build        # 包含安装包
```

### 项目结构

```
codenest/
├── src/              # Vue 前端
│   ├── views/        # 页面组件
│   ├── stores/       # Pinia 状态
│   ├── components/   # 可复用组件
│   └── services/     # 业务逻辑
├── src-tauri/        # Rust 后端
│   └── src/          # Tauri 命令
└── tests/            # 测试文件
```

更多开发指南请参考 [CLAUDE.md](CLAUDE.md) 和 [CONTRIBUTING.md](docs/CONTRIBUTING_CN.md)。

## 键盘快捷键

<table>
<thead>
<tr>
<th width="30%">操作</th>
<th width="35%">快捷键</th>
<th width="35%">作用域</th>
</tr>
</thead>
<tbody>
<tr>
<td>打开项目</td>
<td><kbd>Enter</kbd> / <kbd>Space</kbd></td>
<td>项目焦点</td>
</tr>
<tr>
<td>编辑项目</td>
<td><kbd>Ctrl</kbd>+<kbd>I</kbd> / <kbd>⌘</kbd>+<kbd>I</kbd></td>
<td>项目焦点</td>
</tr>
<tr>
<td>复制路径</td>
<td><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>⌘</kbd>+<kbd>C</kbd></td>
<td>项目焦点</td>
</tr>
<tr>
<td>删除项目</td>
<td><kbd>Delete</kbd> / <kbd>Backspace</kbd></td>
<td>项目焦点</td>
</tr>
<tr>
<td>更多菜单</td>
<td><kbd>Shift</kbd>+<kbd>F10</kbd></td>
<td>项目焦点</td>
</tr>
<tr>
<td>导航</td>
<td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td>
<td>列表/卡片/操作栏</td>
</tr>
</tbody>
</table>

## 反馈与贡献

欢迎通过 [GitHub Issues](https://github.com/MidnightCrowing/CodeNest/issues) 报告问题或提出建议。

如果你想贡献代码，请先阅读 [贡献指南](docs/CONTRIBUTING_CN.md)。

## 许可证

[MIT License](LICENSE.txt) © 2024 MidnightCrowing

## 致谢

本项目使用了以下优秀的开源项目：

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [Vue](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Reka UI](https://reka-ui.com/) - 无样式组件库
- [UnoCSS](https://unocss.dev/) - 即时按需原子化 CSS 引擎
- [Lucide](https://lucide.dev/) - 精美的开源图标库

以及 JetBrains、Microsoft、Anthropic 等公司提供的编辑器图标资源。
