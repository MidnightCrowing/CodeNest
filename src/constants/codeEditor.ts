export enum CodeEditorEnum {
  IntellijIdea = 'intellij-idea',
  PyCharm = 'pycharm',
  PhpStorm = 'phpstorm',
  GoLand = 'goLand',
  Rider = 'rider',
  Clion = 'clion',
  RustRover = 'rust-rover',
  WebStorm = 'webstorm',
  RubyMine = 'rubymine',
  AndroidStudio = 'android-studio',
  VisualStudio = 'visual-studio',
  VisualStudioCode = 'visual-studio-code',
  Cursor = 'cursor',
  Windsurf = 'windsurf',
  Trae = 'trae',
  Zed = 'zed',
  SublimeText = 'sublime-text',
  Neovim = 'neovim',
  CodexCli = 'codex-cli',
  ClaudeCode = 'claude-code',
  GeminiCli = 'gemini-cli',
}

export type EditorCommandKey = CodeEditorEnum

export interface CodeEditorOption {
  label: string
  icon?: string
  description?: string
  group?: string
  defaultCommand: string
  openInTerminal?: boolean
  monochromeIcon?: boolean
}

export interface EditorCommandOption {
  key: EditorCommandKey
  label: string
  icon?: string
  description?: string
  defaultCommand: string
  openInTerminal: boolean
  monochromeIcon?: boolean
  editors: CodeEditorEnum[]
}

export function isCodeEditor(value: unknown): value is CodeEditorEnum {
  return Object.values(CodeEditorEnum).includes(value as CodeEditorEnum)
}

export const jetBrainsEditors = [
  CodeEditorEnum.IntellijIdea,
  CodeEditorEnum.PyCharm,
  CodeEditorEnum.PhpStorm,
  CodeEditorEnum.GoLand,
  CodeEditorEnum.Rider,
  CodeEditorEnum.Clion,
  CodeEditorEnum.RustRover,
  CodeEditorEnum.WebStorm,
  CodeEditorEnum.RubyMine,
] as const satisfies readonly CodeEditorEnum[]

const jetBrainsEditorSet = new Set<CodeEditorEnum>(jetBrainsEditors)

export function isJetBrainsEditor(editor: CodeEditorEnum) {
  return jetBrainsEditorSet.has(editor)
}

export function getEditorCommandKey(editor: CodeEditorEnum): EditorCommandKey {
  return editor
}

export const codeEditors: Record<CodeEditorEnum, CodeEditorOption> = {
  [CodeEditorEnum.IntellijIdea]: {
    group: 'JetBrains',
    label: 'Intellij IDEA',
    description: 'Java  Kotlin  Spring',
    icon: 'i-custom:jetbrains-intellij-idea',
    defaultCommand: 'idea {project}',
  },
  [CodeEditorEnum.PyCharm]: {
    group: 'JetBrains',
    label: 'PyCharm',
    description: 'Python  Django  Jupyter',
    icon: 'i-custom:jetbrains-pycharm',
    defaultCommand: 'pycharm {project}',
  },
  [CodeEditorEnum.PhpStorm]: {
    group: 'JetBrains',
    label: 'PhpStorm',
    description: 'PHP  Laravel  Symfony',
    icon: 'i-custom:jetbrains-phpstorm',
    defaultCommand: 'phpstorm {project}',
  },
  [CodeEditorEnum.GoLand]: {
    group: 'JetBrains',
    label: 'GoLand',
    description: 'Go (Golang)  JavaScript  TypeScript',
    icon: 'i-custom:jetbrains-goland',
    defaultCommand: 'goland {project}',
  },
  [CodeEditorEnum.Rider]: {
    group: 'JetBrains',
    label: 'Rider',
    description: 'C#  .NET  ASP.NET',
    icon: 'i-custom:jetbrains-rider',
    defaultCommand: 'rider {project}',
  },
  [CodeEditorEnum.Clion]: {
    group: 'JetBrains',
    label: 'Clion',
    description: 'C  C++  CMake',
    icon: 'i-custom:jetbrains-clion',
    defaultCommand: 'clion {project}',
  },
  [CodeEditorEnum.RustRover]: {
    group: 'JetBrains',
    label: 'RustRover',
    description: 'Rust  TOML  SQL',
    icon: 'i-custom:jetbrains-rustrover',
    defaultCommand: 'rustrover {project}',
  },
  [CodeEditorEnum.WebStorm]: {
    group: 'JetBrains',
    label: 'WebStorm',
    description: 'JavaScript  TypeScript  React',
    icon: 'i-custom:jetbrains-webstorm',
    defaultCommand: 'webstorm {project}',
  },
  [CodeEditorEnum.RubyMine]: {
    group: 'JetBrains',
    label: 'RubyMine',
    description: 'Ruby on Rails (RoR)  Hotwire  RuboCop',
    icon: 'i-custom:jetbrains-rubymine',
    defaultCommand: 'rubymine {project}',
  },
  [CodeEditorEnum.VisualStudio]: {
    group: 'Microsoft',
    label: 'Visual Studio',
    icon: 'i-custom:visual-studio',
    defaultCommand: 'devenv {project}',
  },
  [CodeEditorEnum.VisualStudioCode]: {
    group: 'Microsoft',
    label: 'Visual Studio Code',
    icon: 'i-custom:visual-studio-code',
    defaultCommand: 'code {project}',
  },
  [CodeEditorEnum.Cursor]: {
    group: 'AI Editors',
    label: 'Cursor',
    description: 'AI coding editor',
    icon: 'i-custom:cursor',
    defaultCommand: 'cursor {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.Windsurf]: {
    group: 'AI Editors',
    label: 'Windsurf',
    description: 'Agentic coding editor',
    icon: 'i-custom:windsurf',
    defaultCommand: 'windsurf {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.Trae]: {
    group: 'AI Editors',
    label: 'Trae',
    description: 'AI coding editor',
    icon: 'i-custom:trae-color',
    defaultCommand: 'trae {project}',
  },
  [CodeEditorEnum.Zed]: {
    group: 'Editors',
    label: 'Zed',
    description: 'Fast collaborative editor',
    icon: 'i-custom:zed-industries',
    defaultCommand: 'zed {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.SublimeText]: {
    group: 'Editors',
    label: 'Sublime Text',
    icon: 'i-custom:sublime-text',
    defaultCommand: 'subl {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.Neovim]: {
    group: 'Terminal Editors',
    label: 'Neovim',
    icon: 'i-custom:neovim',
    defaultCommand: 'nvim .',
    openInTerminal: true,
    monochromeIcon: true,
  },
  [CodeEditorEnum.CodexCli]: {
    group: 'AI CLI',
    label: 'Codex CLI',
    description: 'OpenAI Codex in terminal',
    icon: 'i-custom:codex-color',
    defaultCommand: 'codex',
    openInTerminal: true,
  },
  [CodeEditorEnum.ClaudeCode]: {
    group: 'AI CLI',
    label: 'Claude Code',
    description: 'Anthropic Claude Code in terminal',
    icon: 'i-custom:claude-color',
    defaultCommand: 'claude',
    openInTerminal: true,
  },
  [CodeEditorEnum.GeminiCli]: {
    group: 'AI CLI',
    label: 'Gemini CLI',
    description: 'Google Gemini in terminal',
    icon: 'i-custom:gemini-color',
    defaultCommand: 'gemini',
    openInTerminal: true,
  },
  [CodeEditorEnum.AndroidStudio]: {
    group: 'Google',
    label: 'Android Studio',
    icon: 'i-custom:android-studio-stable',
    defaultCommand: 'studio {project}',
  },
}

export const editorCommandOptions: EditorCommandOption[] = [
  ...Object.entries(codeEditors)
    .map(([editor, option]) => ({
      key: editor as CodeEditorEnum,
      label: option.label,
      icon: option.icon,
      description: option.description || option.group,
      defaultCommand: option.defaultCommand,
      openInTerminal: option.openInTerminal === true,
      monochromeIcon: option.monochromeIcon,
      editors: [editor as CodeEditorEnum],
    })),
]

export const editorCommandKeys = editorCommandOptions.map(option => option.key)

export const editorIconClasses = [
  ...Object.values(codeEditors).map(option => option.icon),
  ...editorCommandOptions.map(option => option.icon),
].filter(icon => icon !== undefined)

export const defaultEditorLangGroups: Record<CodeEditorEnum, string[]> = {
  [CodeEditorEnum.IntellijIdea]: [
    'gradle',
    'java',
    'kotlin',
    'spring',
    'maven pom',
    'groovy',
    'scala',
  ],
  [CodeEditorEnum.PyCharm]: [
    'django',
    'jupyter',
    'pip requirements',
    'python',
    'flask',
    'fastapi',
    'pytest',
  ],
  [CodeEditorEnum.PhpStorm]: [
    'laravel',
    'php',
    'symfony',
    'wordpress',
    'composer',
    'twig',
    'blade',
  ],
  [CodeEditorEnum.GoLand]: ['go'],
  [CodeEditorEnum.Rider]: ['.net', 'asp.net', 'c#'],
  [CodeEditorEnum.Clion]: ['c', 'c++', 'cmake', 'makefile', 'assembly', 'cuda'],
  [CodeEditorEnum.RustRover]: ['rust', 'sql', 'toml', 'ron'],
  [CodeEditorEnum.WebStorm]: [
    'angular',
    'css',
    'html',
    'javascript',
    'jsx',
    'less',
    'react',
    'sass',
    'scss',
    'stylus',
    'typescript',
    'tsx',
    'vue',
    'svelte',
    'astro',
    'pug',
    'handlebars',
    'ejs',
    'graphql',
    'mdx',
  ],
  [CodeEditorEnum.RubyMine]: ['ror', 'ruby on rails', 'ruby', 'erb', 'haml', 'slim'],
  [CodeEditorEnum.AndroidStudio]: ['android', 'dart'],
  [CodeEditorEnum.VisualStudio]: ['f#', 'vb', 'vb.net'],
  [CodeEditorEnum.VisualStudioCode]: [
    'ini',
    'json',
    'markdown',
    'svg',
    'text',
    'xml',
    'yaml',
    'bash',
    'shell',
    'powershell',
    'dotenv',
    'dockerfile',
    'csv',
    'tsv',
    'json5',
    'bicep',
  ],
  [CodeEditorEnum.Cursor]: [
    'javascript',
    'typescript',
    'tsx',
    'vue',
    'react',
    'python',
    'rust',
    'go',
    'markdown',
  ],
  [CodeEditorEnum.Windsurf]: [
    'javascript',
    'typescript',
    'tsx',
    'vue',
    'react',
    'python',
    'go',
    'rust',
  ],
  [CodeEditorEnum.Trae]: ['javascript', 'typescript', 'python', 'go', 'java'],
  [CodeEditorEnum.Zed]: ['rust', 'go', 'typescript', 'javascript', 'python'],
  [CodeEditorEnum.SublimeText]: ['text', 'markdown', 'python', 'javascript'],
  [CodeEditorEnum.Neovim]: ['vim script', 'lua', 'rust', 'go', 'c', 'c++'],
  [CodeEditorEnum.CodexCli]: [],
  [CodeEditorEnum.ClaudeCode]: [],
  [CodeEditorEnum.GeminiCli]: [],
}
