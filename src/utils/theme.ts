export enum ThemeEnum {
  light = 'light',
  dark = 'dark',
}

let currentTheme = ThemeEnum.dark

export async function applyTheme(theme?: ThemeEnum) {
  const rootElement = document.documentElement // 获取 :root 即 <html> 元素
  if (rootElement) {
    rootElement.className = theme ?? currentTheme
  }

  // 修改Electron窗口主题样式
  try {
    await window.api.setWindowTheme(currentTheme)
  }
  catch (error) {
    console.error('Failed to set window theme:', error)
  }
}

export function toggleTheme() {
  currentTheme = currentTheme === ThemeEnum.light ? ThemeEnum.dark : ThemeEnum.light
  applyTheme(currentTheme).then(() => {})
}
