import { ThemeColorEnum, ThemeEnum } from '~/constants/appEnums'

export type ResolvedTheme = ThemeEnum.Light | ThemeEnum.Dark

const DEFAULT_CUSTOM_THEME_COLOR = '#4682fa'
const DEFAULT_SYSTEM_THEME_COLOR = '#4682fa'
const HEX_COLOR_RE = /^#[\da-f]{6}$/i
const SYSTEM_DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'
const cachedSystemThemeColors: Partial<Record<ResolvedTheme, string>> = {}

export function getPreferredSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia?.(SYSTEM_DARK_MEDIA_QUERY).matches)
    return ThemeEnum.Dark

  return ThemeEnum.Light
}

export function resolveTheme(theme?: ThemeEnum): ResolvedTheme {
  if (theme === ThemeEnum.Dark || theme === ThemeEnum.Light)
    return theme

  return getPreferredSystemTheme()
}

export function watchSystemTheme(callback: (theme: ResolvedTheme) => void) {
  if (typeof window === 'undefined' || !window.matchMedia)
    return () => {}

  const mediaQuery = window.matchMedia(SYSTEM_DARK_MEDIA_QUERY)
  const listener = (event: MediaQueryListEvent) => {
    callback(event.matches ? ThemeEnum.Dark : ThemeEnum.Light)
  }

  mediaQuery.addEventListener('change', listener)
  return () => mediaQuery.removeEventListener('change', listener)
}

function normalizeCustomThemeColor(color?: string) {
  return color && HEX_COLOR_RE.test(color) ? color : DEFAULT_CUSTOM_THEME_COLOR
}

function normalizeThemeColor(color?: string | null, fallback = DEFAULT_SYSTEM_THEME_COLOR) {
  return color && HEX_COLOR_RE.test(color) ? color : fallback
}

function readableForeground(hexColor: string) {
  const value = hexColor.slice(1)
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
  return luminance > 0.58 ? '#111111' : '#ffffff'
}

function rgbToHex(rgbColor: string) {
  const match = rgbColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (!match)
    return null

  const [, red, green, blue] = match
  return `#${[red, green, blue].map(value => Number(value).toString(16).padStart(2, '0')).join('')}`
}

function getCssSystemAccentColor() {
  const probe = document.createElement('span')
  probe.style.color = 'AccentColor'
  probe.style.position = 'fixed'
  probe.style.pointerEvents = 'none'
  probe.style.opacity = '0'
  const probeParent = document.body ?? document.documentElement
  probeParent.append(probe)
  const color = rgbToHex(window.getComputedStyle(probe).color)
  probe.remove()
  return normalizeThemeColor(color)
}

async function getSystemThemeColor(theme: ResolvedTheme) {
  const cachedSystemThemeColor = cachedSystemThemeColors[theme]
  if (cachedSystemThemeColor)
    return cachedSystemThemeColor

  let systemThemeColor = DEFAULT_SYSTEM_THEME_COLOR

  try {
    systemThemeColor = normalizeThemeColor(await window.api.getSystemAccentColor(theme))
  }
  catch (error) {
    console.error('Failed to get system accent color:', error)
    systemThemeColor = getCssSystemAccentColor()
  }

  cachedSystemThemeColors[theme] = systemThemeColor
  return systemThemeColor
}

export async function applyTheme(theme?: ThemeEnum, themeColor?: ThemeColorEnum, customThemeColor?: string) {
  const rootElement = document.documentElement
  if (!rootElement) {
    console.warn('Root element not found. Theme application aborted.')
    return
  }

  const newTheme = resolveTheme(theme)
  const newThemeColor = themeColor ?? ThemeColorEnum.Contrast
  const normalizedCustomThemeColor = normalizeCustomThemeColor(customThemeColor)
  const systemThemeColor = await getSystemThemeColor(newTheme)
  rootElement.classList.remove(ThemeEnum.Light, ThemeEnum.Dark)
  rootElement.classList.remove(
    ...Object.values(ThemeColorEnum).map(color => `theme-${color}`),
  )
  rootElement.style.setProperty('--custom-theme-color', normalizedCustomThemeColor)
  rootElement.style.setProperty('--custom-theme-foreground', readableForeground(normalizedCustomThemeColor))
  rootElement.style.setProperty('--system-theme-color', systemThemeColor)
  rootElement.style.setProperty('--system-theme-foreground', readableForeground(systemThemeColor))
  rootElement.classList.add(newTheme)
  rootElement.classList.add(`theme-${newThemeColor}`)

  try {
    window.api.setWindowTheme(newTheme)
  }
  catch (error) {
    console.error('Failed to set window theme:', error)
  }
}
