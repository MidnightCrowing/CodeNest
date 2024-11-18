export interface CodeEditorOption {
  value: string // 选项的值
  label: string // 显示文本
  icon?: string // 图标类名
  description?: string // 描述注释
  group?: string // 所在分类
}

export const codeEditors: CodeEditorOption[] = [
  {
    group: 'JetBrains',
    value: 'intellij-idea',
    label: 'Intellij IDEA',
    description: 'Java  Kotlin  Spring',
    icon: 'i-custom:jetbrains-intellij-idea',
  },
  {
    group: 'JetBrains',
    value: 'pycharm',
    label: 'PyCharm',
    description: 'Python  Django  Jupyter',
    icon: 'i-custom:jetbrains-pycharm',
  },
  {
    group: 'JetBrains',
    value: 'phpstorm',
    label: 'PhpStorm',
    description: 'PHP  Laravel  Symfony',
    icon: 'i-custom:jetbrains-phpstorm',
  },
  {
    group: 'JetBrains',
    value: 'goLand',
    label: 'GoLand',
    description: 'Go (Golang)  JavaScript  TypeScript',
    icon: 'i-custom:jetbrains-goland',
  },
  {
    group: 'JetBrains',
    value: 'rider',
    label: 'Rider',
    description: 'C#  .NET  ASP.NET',
    icon: 'i-custom:jetbrains-rider',
  },
  {
    group: 'JetBrains',
    value: 'clion',
    label: 'Clion',
    description: 'C  C++  CMake',
    icon: 'i-custom:jetbrains-clion',
  },
  {
    group: 'JetBrains',
    value: 'rust-rover',
    label: 'RustRover',
    description: 'Rust  TOML  SQL',
    icon: 'i-custom:jetbrains-rustrover',
  },
  {
    group: 'JetBrains',
    value: 'webstorm',
    label: 'WebStorm',
    description: 'JavaScript  TypeScript  React',
    icon: 'i-custom:jetbrains-webstorm',
  },
  {
    group: 'JetBrains',
    value: 'rubymine',
    label: 'RubyMine',
    description: 'Ruby on Rails (RoR)  Hotwire  RuboCop',
    icon: 'i-custom:jetbrains-rubymine',
  },
  {
    group: 'JetBrains',
    value: 'aqua',
    label: 'Aqua',
    description: 'Selenium  Selenide  Playwright',
    icon: 'i-custom:jetbrains-aqua',
  },
  {
    group: 'JetBrains',
    value: 'fleet',
    label: 'Fleet',
    description: 'JavaScript  Python  PHP  C#  Java  Kotlin',
    icon: 'i-custom:jetbrains-fleet',
  },
  {
    group: 'Google',
    value: 'android-studio',
    label: 'Android Studio',
    icon: 'i-custom:android-studio-stable',
  },
  {
    group: 'Microsoft',
    value: 'visual-studio',
    label: 'Visual Studio',
    icon: 'i-custom:visual-studio',
  },
  {
    group: 'Microsoft',
    value: 'visual-studio-code',
    label: 'Visual Studio Code',
    icon: 'i-custom:visual-studio-code',
  },
]

// 从 codeEditors 中提取所有 icon 字段的值，并将它们映射为一个数组，
// 用于生成图标类名的 safelist，以确保这些动态生成的类名被 Unocss 识别并编译。
export const editorIconClasses = codeEditors.map(option => option.icon)
