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
  descriptionKey?: string
  groupKey: string
  defaultCommand: string
  openInTerminal?: boolean
  monochromeIcon?: boolean
}

export interface EditorCommandOption {
  key: EditorCommandKey
  label: string
  icon?: string
  descriptionKey?: string
  groupKey: string
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
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'IntelliJ IDEA',
    descriptionKey: 'app.settings.editors.descriptions.intellij_idea',
    icon: 'i-custom:jetbrains-intellij-idea',
    defaultCommand: 'idea {project}',
  },
  [CodeEditorEnum.PyCharm]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'PyCharm',
    descriptionKey: 'app.settings.editors.descriptions.pycharm',
    icon: 'i-custom:jetbrains-pycharm',
    defaultCommand: 'pycharm {project}',
  },
  [CodeEditorEnum.PhpStorm]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'PhpStorm',
    descriptionKey: 'app.settings.editors.descriptions.phpstorm',
    icon: 'i-custom:jetbrains-phpstorm',
    defaultCommand: 'phpstorm {project}',
  },
  [CodeEditorEnum.GoLand]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'GoLand',
    descriptionKey: 'app.settings.editors.descriptions.goland',
    icon: 'i-custom:jetbrains-goland',
    defaultCommand: 'goland {project}',
  },
  [CodeEditorEnum.Rider]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'Rider',
    descriptionKey: 'app.settings.editors.descriptions.rider',
    icon: 'i-custom:jetbrains-rider',
    defaultCommand: 'rider {project}',
  },
  [CodeEditorEnum.Clion]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'CLion',
    descriptionKey: 'app.settings.editors.descriptions.clion',
    icon: 'i-custom:jetbrains-clion',
    defaultCommand: 'clion {project}',
  },
  [CodeEditorEnum.RustRover]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'RustRover',
    descriptionKey: 'app.settings.editors.descriptions.rust_rover',
    icon: 'i-custom:jetbrains-rustrover',
    defaultCommand: 'rustrover {project}',
  },
  [CodeEditorEnum.WebStorm]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'WebStorm',
    descriptionKey: 'app.settings.editors.descriptions.webstorm',
    icon: 'i-custom:jetbrains-webstorm',
    defaultCommand: 'webstorm {project}',
  },
  [CodeEditorEnum.RubyMine]: {
    groupKey: 'app.settings.editors.groups.jetbrains',
    label: 'RubyMine',
    descriptionKey: 'app.settings.editors.descriptions.rubymine',
    icon: 'i-custom:jetbrains-rubymine',
    defaultCommand: 'rubymine {project}',
  },
  [CodeEditorEnum.VisualStudio]: {
    groupKey: 'app.settings.editors.groups.microsoft',
    label: 'Visual Studio',
    icon: 'i-custom:visual-studio',
    defaultCommand: 'devenv {project}',
  },
  [CodeEditorEnum.VisualStudioCode]: {
    groupKey: 'app.settings.editors.groups.microsoft',
    label: 'Visual Studio Code',
    icon: 'i-custom:visual-studio-code',
    defaultCommand: 'code {project}',
  },
  [CodeEditorEnum.Cursor]: {
    groupKey: 'app.settings.editors.groups.ai_editors',
    label: 'Cursor',
    descriptionKey: 'app.settings.editors.descriptions.cursor',
    icon: 'i-custom:cursor',
    defaultCommand: 'cursor {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.Windsurf]: {
    groupKey: 'app.settings.editors.groups.ai_editors',
    label: 'Windsurf',
    descriptionKey: 'app.settings.editors.descriptions.windsurf',
    icon: 'i-custom:windsurf',
    defaultCommand: 'windsurf {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.Trae]: {
    groupKey: 'app.settings.editors.groups.ai_editors',
    label: 'Trae',
    descriptionKey: 'app.settings.editors.descriptions.trae',
    icon: 'i-custom:trae-color',
    defaultCommand: 'trae {project}',
  },
  [CodeEditorEnum.Zed]: {
    groupKey: 'app.settings.editors.groups.editors',
    label: 'Zed',
    descriptionKey: 'app.settings.editors.descriptions.zed',
    icon: 'i-custom:zed-industries',
    defaultCommand: 'zed {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.SublimeText]: {
    groupKey: 'app.settings.editors.groups.editors',
    label: 'Sublime Text',
    icon: 'i-custom:sublime-text',
    defaultCommand: 'subl {project}',
    monochromeIcon: true,
  },
  [CodeEditorEnum.Neovim]: {
    groupKey: 'app.settings.editors.groups.terminal_editors',
    label: 'Neovim',
    icon: 'i-custom:neovim',
    defaultCommand: 'nvim .',
    openInTerminal: true,
    monochromeIcon: true,
  },
  [CodeEditorEnum.CodexCli]: {
    groupKey: 'app.settings.editors.groups.ai_cli',
    label: 'Codex CLI',
    descriptionKey: 'app.settings.editors.descriptions.codex_cli',
    icon: 'i-custom:codex-color',
    defaultCommand: 'codex',
    openInTerminal: true,
  },
  [CodeEditorEnum.ClaudeCode]: {
    groupKey: 'app.settings.editors.groups.ai_cli',
    label: 'Claude Code',
    descriptionKey: 'app.settings.editors.descriptions.claude_code',
    icon: 'i-custom:claude-color',
    defaultCommand: 'claude',
    openInTerminal: true,
  },
  [CodeEditorEnum.GeminiCli]: {
    groupKey: 'app.settings.editors.groups.ai_cli',
    label: 'Gemini CLI',
    descriptionKey: 'app.settings.editors.descriptions.gemini_cli',
    icon: 'i-custom:gemini-color',
    defaultCommand: 'gemini',
    openInTerminal: true,
  },
  [CodeEditorEnum.AndroidStudio]: {
    groupKey: 'app.settings.editors.groups.google',
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
      descriptionKey: option.descriptionKey,
      groupKey: option.groupKey,
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
