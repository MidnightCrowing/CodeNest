# 贡献指南

感谢您愿意为 CodeNest 项目做出贡献！请在开始之前阅读以下指南，帮助您顺利进行开发。

## 设置开发环境

请确保本地安装了 [Node.js](https://nodejs.org/)、[pnpm](https://pnpm.io/) 和 [Rust](https://www.rust-lang.org/tools/install)。

## 安装依赖

```bash
# 安装依赖
pnpm install

# 运行桌面开发环境
pnpm dev
```

## 项目结构

```
CodeNest
  ├── .github     # GitHub Actions 工作流
  ├── docs        # 文档和界面截图
  ├── icons       # 图标源文件
  ├── scripts     # 自动化脚本
  ├── src         # Vue 应用源代码和共置的前端单元测试
  ├── src-tauri   # Tauri 桌面壳和本地命令
```

## 构建

```bash
# 检查代码、类型和测试
pnpm check

# 只构建 Tauri 可执行文件，不生成安装包
pnpm build:exe

# 构建平台安装包
pnpm build
```

构建产物位于 `src-tauri/target/release` 和 `src-tauri/target/release/bundle`。

## 发布与自动更新

Release 工作流使用 Tauri Updater 签名安装包。首次发布前生成一对签名密钥：

```bash
pnpm tauri signer generate -- -w ~/.tauri/codenest.key
```

将私钥内容配置到 GitHub 仓库的 Actions secrets：

- `TAURI_SIGNING_PRIVATE_KEY`：`~/.tauri/codenest.key` 的完整内容
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`：如果生成密钥时设置了密码则填写，否则留空

私钥不能提交到仓库；丢失私钥或密码后，已安装的应用将无法接收后续更新。

## 贡献

### 关于分支

#### 常驻分支

- **main**: 用此分支进行错误修复、新功能的开发、性能改进或对国际化（i18n）文件的修改。

#### 其他临时分支

- **feat/**: 此分支用于提交新的功能
- **doc/**: 此分支专门用于修复文档, 不涉及功能改动。
- **fix/**: 此分支专门用于修复 dev 分支中出现的错误。

### Commit 规范

你也可以参照 [Angular commit message guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)

- `feat`：新功能
- `fix`：修复 Bug
- `docs`：文档更新
- `style`：不影响代码含义的更改（空格、格式、缺少分号等）
- `refactor`：重构代码
- `test`：添加或更新测试
- `chore`：构建过程或工具链的变更
- `perf`：性能改进
- `ci`：持续集成/交付的变更
  也欢迎增加 scope 和 footer
  例如:
  `fix(dock): xxx`
  `变更描述`
  `相关 PR: url`

### I18n

- 在进行翻译时，如果你遇到一种你不熟悉的语言，可以使用另一种你已经翻译过的语言，并在 PR 中指出你无法翻译的语言。

- **请手动维护 i18n 国际化文件！！！** 不要使用 `i18n Ally` 或其他扩展来维护它们。使用
  `i18n Ally` 进行维护会不确定翻译放在哪里或删除代码注释。
