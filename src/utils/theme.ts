import { ThemeEnum } from '~/constants/appEnums'

export const currentTheme: Ref<ThemeEnum> = ref(ThemeEnum.Light)

export async function applyTheme(theme: string) {
  try {
    // 检查 setTitleBarOverlay 方法是否存在
    const win = await window.electron.getMainWindow()
    if (win && typeof win.setTitleBarOverlay === 'function') {
      await window.electron.invoke('set-theme', theme)
    }
    else {
      // 降级处理：仅设置主题类名
      document.documentElement.className = theme
    }
  }
  catch (error) {
    console.warn('Failed to set window theme:', error)
    // 降级处理：仅设置主题类名
    document.documentElement.className = theme
  }
}

watch(currentTheme, applyTheme)
