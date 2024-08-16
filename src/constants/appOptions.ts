interface AppOption {
  value: string
  label: string
  iconClass?: string
  description?: string
  category?: string
}

export const appOptions: AppOption[] = [
  {
    category: 'JetBrains',
    value: 'intellij-idea',
    label: 'Intellij IDEA',
    description: 'Java  Kotlin  Spring',
    iconClass: 'i-static-jetbrains-intellij-idea',
  },
  {
    category: 'JetBrains',
    value: 'pycharm',
    label: 'PyCharm',
    description: 'Python  Django  Jupyter',
    iconClass: 'i-static-jetbrains-pycharm',
  },
  {
    category: 'JetBrains',
    value: 'phpstorm',
    label: 'PhpStorm',
    description: 'PHP  Laravel  Symfony',
    iconClass: 'i-static-jetbrains-phpstorm',
  },
  {
    category: 'JetBrains',
    value: 'goLand',
    label: 'GoLand',
    description: 'Go (Golang)  JavaScript  TypeScript',
    iconClass: 'i-static-jetbrains-goland',
  },
  {
    category: 'JetBrains',
    value: 'rider',
    label: 'Rider',
    description: 'C#  .NET  ASP.NET',
    iconClass: 'i-static-jetbrains-rider',
  },
  {
    category: 'JetBrains',
    value: 'clion',
    label: 'Clion',
    description: 'C  C++  CMake',
    iconClass: 'i-static-jetbrains-clion',
  },
  {
    category: 'JetBrains',
    value: 'rust-rover',
    label: 'RustRover',
    description: 'Rust  TOML  SQL',
    iconClass: 'i-static-jetbrains-rustrover',
  },
  {
    category: 'JetBrains',
    value: 'webstorm',
    label: 'WebStorm',
    description: 'JavaScript  TypeScript  React',
    iconClass: 'i-static-jetbrains-webstorm',
  },
  {
    category: 'JetBrains',
    value: 'rubymine',
    label: 'RubyMine',
    description: 'Ruby on Rails (RoR)  Hotwire  RuboCop',
    iconClass: 'i-static-jetbrains-rubymine',
  },
  {
    category: 'JetBrains',
    value: 'aqua',
    label: 'Aqua',
    description: 'Selenium  Selenide  Playwright',
    iconClass: 'i-static-jetbrains-aqua',
  },
  {
    category: 'JetBrains',
    value: 'fleet',
    label: 'Fleet',
    description: 'JavaScript  Python  PHP  C#  Java  Kotlin',
    iconClass: 'i-static-jetbrains-fleet',
  },
  {
    category: 'Google',
    value: 'android-studio',
    label: 'Android Studio',
    iconClass: 'i-static-android-studio-stable',
  },
  {
    category: 'Microsoft',
    value: 'visual-studio',
    label: 'Visual Studio',
    iconClass: 'i-static-visual-studio',
  },
  {
    category: 'Microsoft',
    value: 'visual-studio-code',
    label: 'Visual Studio Code',
    iconClass: 'i-static-visual-studio-code',
  },
]

// 从 appOptions 中提取所有 iconClass 字段的值，并将它们映射为一个数组，
// 用于生成图标类名的 safelist，以确保这些动态生成的类名被 Unocss 识别并编译。
export const appIconClasses = appOptions.map(option => option.iconClass)
