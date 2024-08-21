import { commonStyle } from './common'
import type { Theme } from './interface'
import { darkTheme as theme } from './themeColors'

const bgContent = 'rgb(30 31 34)'
const bgDialog = 'rgb(43 45 48)'
const borderDefault = 'rgb(69 72 77)'

export const darkTheme: Theme = {
  window: {
    focusIn: bgDialog,
    focusOut: 'rgb(60 63 65)',
  },
  text: {
    default: commonStyle.text.light,
    link: theme.defaultColor,
    linkHover: theme.defaultColor80,
    infoPanel: 'rgb(90 93 99)',
    infoInput: 'rgb(111 115 122)',
    selection: 'rgb(131 131 145 / 30%)',
    caret: 'rgb(187 187 187 / 80%)',
  },
  panel: {
    bgContent,
    bgDialog,
  },
  button: {
    bgPrimary: theme.defaultColor,
    bgSecondary: bgDialog,
    bgHoverTertiary: 'rgb(81 81 81 / 50%)',
    bgActivePrimary: theme.defaultColor80,
    bgActiveTertiary: 'rgb(81 81 81 / 30%)',
    borderPrimary: theme.defaultColor,
    borderSecondary: borderDefault,
    borderActiveSecondary: theme.defaultColor80,
  },
  buttonGroup: {
    bgHover: 'rgb(81 81 81 / 50%)',
    bgActive: 'rgb(81 81 81 / 50%)',
    border: borderDefault,
    borderActive: 'rgb(111 115 122)',
  },
  field: {
    bg: bgDialog,
    border: borderDefault,
    borderFocused: theme.defaultColor,
    borderError: 'rgb(139 60 60)',
    iconBgHover: 'rgb(81 81 81 / 50%)',
    iconBgActive: 'rgb(81 81 81 / 30%)',
  },
  dropdown: {
    bg: bgDialog,
    bgSelected: theme.selectedColor,
    border: borderDefault,
    borderFocused: theme.defaultColor,
    borderError: 'rgb(139 60 60)',
  },
  chbRb: {
    bg: bgDialog,
    bgActive: theme.defaultColor80,
    border: borderDefault,
    borderFocused: theme.defaultColor,
    borderActive: theme.defaultColor80,
  },
  tag: {
    bgUnselectable: 'rgb(81 81 81 / 30%)',
    bgSelectable: bgDialog,
    bgSelected: 'rgb(81 81 81 / 50%)',
    border: borderDefault,
    borderSelected: 'rgb(111 115 122)',
  },
  hr: {
    bg: borderDefault,
  },
  scrollbar: {
    thumb: 'rgb(255 255 255 / 15%)',
    thumbHover: 'rgb(255 255 255 / 25%)',
  },
}
