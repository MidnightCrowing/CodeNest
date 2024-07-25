import { Theme } from '~/constants/theme'

import('~/styles/main.scss')
const currentTheme: Ref<Theme> = ref(Theme.dark)

// 应用主题的函数
function applyTheme(theme: Theme) {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.className = theme
  }

  if (theme === Theme.dark) {
    import('~/styles/dark.scss')
  }
  else {
    import('~/styles/light.scss')
  }
}

// 切换主题的函数
// function toggleTheme() {
//   currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
//   applyTheme(currentTheme.value)
// }

export { applyTheme, currentTheme }
