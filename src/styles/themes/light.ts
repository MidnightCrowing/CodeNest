import { commonStyle } from './common'
import type { Theme } from './interface'
import { lightTheme as theme } from './themeColors'

const bgContent = 'rgb(255 255 255)'
const bgDialog = 'rgb(242 242 242)'
const borderDefault = 'rgb(215 217 224)'

export const lightTheme: Theme = {
  window: {
    focusIn: bgDialog,
    focusOut: 'rgb(235 236 240)',
  },
  text: {
    default: commonStyle.text.dark,
    link: theme.defaultColor,
    linkHover: theme.defaultColor80,
    infoPanel: 'rgb(165 162 156)', // Inline help, shortcuts
    infoInput: 'rgb(144 140 133)', // Additional information in lists (paths, counters), placeholder
    selection: 'rgb(124 124 110 / 30%)',
    caret: 'rgb(68 68 68 / 80%)', // 光标颜色
  },
  panel: {
    bgContent,
    bgDialog,
  },
  button: {
    bgPrimary: theme.defaultColor,
    bgSecondary: commonStyle.text.white,
    bgHoverTertiary: 'rgb(200 200 200 / 30%)',
    bgActivePrimary: theme.defaultColor80,
    bgActiveTertiary: 'rgb(200 200 200 / 20%)',
    borderPrimary: theme.defaultColor,
    borderSecondary: borderDefault,
    borderActiveSecondary: theme.defaultColor80,
  },
  buttonGroup: {
    bgHover: 'rgb(200 200 200 / 50%)',
    bgActive: commonStyle.text.white,
    border: borderDefault,
    borderActive: 'rgb(179 184 198)',
  },
  field: {
    bg: commonStyle.text.white,
    border: borderDefault,
    borderFocused: theme.defaultColor,
    borderError: 'rgb(220 66 81)',
    iconBgHover: 'rgb(200 200 200 / 50%)',
    iconBgActive: 'rgb(200 200 200 / 30%)',
  },
  dropdown: {
    bg: commonStyle.text.white,
    bgSelected: theme.selectedColor,
    border: borderDefault,
    borderFocused: theme.defaultColor,
  },
  // Checkbox & Radio button
  chbRb: {
    bg: commonStyle.text.white,
    bgActive: theme.defaultColor80,
    border: borderDefault,
    borderFocused: theme.defaultColor,
    borderActive: theme.defaultColor80,
  },
  tag: {
    bg: bgDialog,
    bgSelected: commonStyle.text.white,
    border: borderDefault,
    borderSelected: 'rgb(179 184 198)',
  },
  hr: {
    bg: borderDefault,
  },
  scrollbar: {
    thumb: 'rgb(0 0 0 / 15%)',
    thumbHover: 'rgb(0 0 0 / 25%)',
  },
}
