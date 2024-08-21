import { Theme } from '~/constants/theme'

let currentTheme = Theme.dark

async function applyTheme(theme?: Theme) {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.classList.remove(Theme.light, Theme.dark)
    appElement.classList.add(theme ?? currentTheme)
  }
  await window.api.setWindowTheme(currentTheme)
}

function toggleTheme() {
  currentTheme = currentTheme === Theme.light ? Theme.dark : Theme.light
  applyTheme(currentTheme).then(() => {})
}

export { applyTheme, toggleTheme }
