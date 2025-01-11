export interface CodeEditorOption {
  label: string // 显示文本
  icon?: string // 图标类名
  description?: string // 描述注释
  group?: string // 所在分类
}

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
  Aqua = 'aqua',
  Fleet = 'fleet',
  AndroidStudio = 'android-studio',
  VisualStudio = 'visual-studio',
  VisualStudioCode = 'visual-studio-code',
}

export const codeEditors: Record<CodeEditorEnum, CodeEditorOption> = {
  [CodeEditorEnum.IntellijIdea]: {
    group: 'JetBrains',
    label: 'Intellij IDEA',
    description: 'Java  Kotlin  Spring',
    icon: 'i-custom:jetbrains-intellij-idea',
  },

  [CodeEditorEnum.PyCharm]: {
    group: 'JetBrains',
    label: 'PyCharm',
    description: 'Python  Django  Jupyter',
    icon: 'i-custom:jetbrains-pycharm',
  },
  [CodeEditorEnum.PhpStorm]: {
    group: 'JetBrains',
    label: 'PhpStorm',
    description: 'PHP  Laravel  Symfony',
    icon: 'i-custom:jetbrains-phpstorm',
  },
  [CodeEditorEnum.GoLand]: {
    group: 'JetBrains',
    label: 'GoLand',
    description: 'Go (Golang)  JavaScript  TypeScript',
    icon: 'i-custom:jetbrains-goland',
  },
  [CodeEditorEnum.Rider]: {
    group: 'JetBrains',
    label: 'Rider',
    description: 'C#  .NET  ASP.NET',
    icon: 'i-custom:jetbrains-rider',
  },
  [CodeEditorEnum.Clion]: {
    group: 'JetBrains',
    label: 'Clion',
    description: 'C  C++  CMake',
    icon: 'i-custom:jetbrains-clion',
  },
  [CodeEditorEnum.RustRover]: {
    group: 'JetBrains',
    label: 'RustRover',
    description: 'Rust  TOML  SQL',
    icon: 'i-custom:jetbrains-rustrover',
  },
  [CodeEditorEnum.WebStorm]: {
    group: 'JetBrains',
    label: 'WebStorm',
    description: 'JavaScript  TypeScript  React',
    icon: 'i-custom:jetbrains-webstorm',
  },
  [CodeEditorEnum.RubyMine]: {
    group: 'JetBrains',
    label: 'RubyMine',
    description: 'Ruby on Rails (RoR)  Hotwire  RuboCop',
    icon: 'i-custom:jetbrains-rubymine',
  },
  [CodeEditorEnum.Aqua]: {
    group: 'JetBrains',
    label: 'Aqua',
    description: 'Selenium  Selenide  Playwright',
    icon: 'i-custom:jetbrains-aqua',
  },
  [CodeEditorEnum.Fleet]: {
    group: 'JetBrains',
    label: 'Fleet',
    description: 'JavaScript  Python  PHP  C#  Java  Kotlin',
    icon: 'i-custom:jetbrains-fleet',
  },
  [CodeEditorEnum.VisualStudio]: {
    group: 'Microsoft',
    label: 'Visual Studio',
    icon: 'i-custom:visual-studio',
  },
  [CodeEditorEnum.VisualStudioCode]: {
    group: 'Microsoft',
    label: 'Visual Studio Code',
    icon: 'i-custom:visual-studio-code',
  },
  [CodeEditorEnum.AndroidStudio]: {
    group: 'Google',
    label: 'Android Studio',
    icon: 'i-custom:android-studio-stable',
  },
}

// 从 codeEditors 中提取所有 icon 字段的值，并将它们映射为一个数组，
// 用于生成图标类名的 safelist，以确保这些动态生成的类名被 Unocss 识别并编译。
export const editorIconClasses = Object.values(codeEditors)
  .map(option => option.icon)
  .filter(icon => icon !== undefined)

export const languageToEditorMap: Record<string, CodeEditorEnum> = {
  // IntellijIdea
  'gradle': CodeEditorEnum.IntellijIdea,
  'java': CodeEditorEnum.IntellijIdea,
  'kotlin': CodeEditorEnum.IntellijIdea,
  'spring': CodeEditorEnum.IntellijIdea,

  // PyCharm
  'django': CodeEditorEnum.PyCharm,
  'jupyter': CodeEditorEnum.PyCharm,
  'pip requirements': CodeEditorEnum.PyCharm,
  'python': CodeEditorEnum.PyCharm,

  // PhpStorm
  'laravel': CodeEditorEnum.PhpStorm,
  'php': CodeEditorEnum.PhpStorm,
  'symfony': CodeEditorEnum.PhpStorm,

  // GoLand
  'go': CodeEditorEnum.GoLand,

  // Rider
  '.net': CodeEditorEnum.Rider,
  'asp.net': CodeEditorEnum.Rider,
  'c#': CodeEditorEnum.Rider,

  // Clion
  'c': CodeEditorEnum.Clion,
  'c++': CodeEditorEnum.Clion,
  'cmake': CodeEditorEnum.Clion,

  // RustRover
  'rust': CodeEditorEnum.RustRover,
  'sql': CodeEditorEnum.RustRover,
  'toml': CodeEditorEnum.RustRover,

  // WebStorm
  'angular': CodeEditorEnum.WebStorm,
  'css': CodeEditorEnum.WebStorm,
  'html': CodeEditorEnum.WebStorm,
  'javascript': CodeEditorEnum.WebStorm,
  'less': CodeEditorEnum.WebStorm,
  'react': CodeEditorEnum.WebStorm,
  'sass': CodeEditorEnum.WebStorm,
  'scss': CodeEditorEnum.WebStorm,
  'stylus': CodeEditorEnum.WebStorm,
  'typescript': CodeEditorEnum.WebStorm,
  'vue': CodeEditorEnum.WebStorm,

  // RubyMine
  'ror': CodeEditorEnum.RubyMine,
  'ruby on rails': CodeEditorEnum.RubyMine,
  'ruby': CodeEditorEnum.RubyMine,

  // Visual Studio Code
  'ini': CodeEditorEnum.VisualStudioCode,
  'json': CodeEditorEnum.VisualStudioCode,
  'markdown': CodeEditorEnum.VisualStudioCode,
  'svg': CodeEditorEnum.VisualStudioCode,
  'text': CodeEditorEnum.VisualStudioCode,
  'xml': CodeEditorEnum.VisualStudioCode,
  'yaml': CodeEditorEnum.VisualStudioCode,
}
