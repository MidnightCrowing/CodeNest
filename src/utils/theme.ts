import { ThemeColorEnum, ThemeEnum } from '~/constants/appEnums'

export async function applyTheme(theme?: ThemeEnum, themeColor?: ThemeColorEnum) {
  const rootElement = document.documentElement
  if (!rootElement) {
    console.warn('Root element not found. Theme application aborted.')
    return
  }

  const newTheme = theme ?? ThemeEnum.Light
  const newThemeColor = themeColor ?? ThemeColorEnum.Blue
  rootElement.classList.remove(ThemeEnum.Light, ThemeEnum.Dark)
  rootElement.classList.remove(
    ...Object.values(ThemeColorEnum).map(color => `theme-${color}`),
  )
  rootElement.classList.add(newTheme)
  rootElement.classList.add(`theme-${newThemeColor}`)

  try {
    window.api.setWindowTheme(newTheme)
  }
  catch (error) {
    console.error('Failed to set window theme:', error)
  }
}
