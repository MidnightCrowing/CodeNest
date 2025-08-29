import { ThemeEnum } from '~/constants/appEnums'

export async function applyTheme(theme?: ThemeEnum) {
  const rootElement = document.documentElement // 获取 :root，即 <html> 元素
  if (!rootElement) {
    console.warn('Root element not found. Theme application aborted.')
    return
  }

  // 更新 HTML 的 className
  const newTheme = theme ?? ThemeEnum.Light
  if (rootElement.className !== newTheme) {
    rootElement.className = newTheme
  }

  // 更新 Electron 窗口主题样式
  try {
    window.api.setWindowTheme(newTheme)
  }
  catch (error) {
    console.error('Failed to set window theme:', error)
  }
}
