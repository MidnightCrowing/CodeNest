# 贡献指南

感谢您愿意为 CodeNest 项目做出贡献！请在开始之前阅读以下指南，帮助您顺利进行开发。

## 设置开发环境

请确保本地安装了 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。

## 安装依赖

```bash
# 安装所有依赖（包括组件库）
pnpm install

# 编译组件库
pnpm ui:build

# 运行项目
pnpm dev
```

## 项目结构

```
CodeNest
  ├── data        # 存储用户数据和配置文件
  ├── electron    # Electron 相关的应用逻辑和配置
  ├── icons       # 项目使用的图标和资源文件
  ├── jetv-ui     # 组件库的代码和相关资源
  ├── scripts     # 用于自动化任务的脚本文件
  ├── src         # Vue 应用的源代码和核心逻辑
```

## 构建

```bash
# 构建项目
pnpm build
```

你可以在 `build` 目录中找到构建后的安装包及解压的软件。

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
