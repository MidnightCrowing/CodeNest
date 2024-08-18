import { Theme } from '~/constants/theme'

const currentTheme: Ref<Theme> = ref(Theme.light)

function applyTheme(theme: Theme) {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.className = theme
  }

  if (theme === Theme.dark) {
    import('~/styles/dark.scss')
      .catch(err => console.error(err))
  }
  else {
    import('~/styles/light.scss')
      .catch(err => console.error(err))
  }
}

// function toggleTheme() {
//   currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
//   applyTheme(currentTheme.value)
// }

export { applyTheme, currentTheme }
