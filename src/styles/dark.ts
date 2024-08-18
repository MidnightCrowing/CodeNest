import { defaultTheme } from './default'
import {
  themeDarkDefaultColor,
  themeDarkDefaultColor80,
  themeDarkSelectedColor,
} from './theme'

const bgContent = 'rgb(30 31 34)'
const bgDialog = 'rgb(43 45 48)'
const borderDefault = 'rgb(69 72 77)'

export const darkTheme = {
  window: {
    focusIn: bgDialog,
    focusOut: 'rgb(60 63 65)',
  },
  text: {
    default: defaultTheme.text.light,
    link: themeDarkDefaultColor,
    linkHover: themeDarkDefaultColor80,
    infoPanel: 'rgb(90 93 99)', // Inline help, shortcuts
    infoInput: 'rgb(111 115 122)', // Additional information in lists (paths, counters), placeholder
    selection: 'rgb(131 131 145 / 30%)',
    caret: 'rgb(187 187 187 / 80%)', // 光标颜色
  },
  panel: {
    bgContent,
    bgDialog,
  },
  button: {
    default: themeDarkDefaultColor,
    defaultActive: themeDarkDefaultColor80,
    bg: bgDialog,
    bgHover: 'rgb(81 81 81 / 50%)',
    bgActive: 'rgb(81 81 81 / 30%)',
    border: borderDefault,
    borderActive: themeDarkDefaultColor80,
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
    borderFocused: themeDarkDefaultColor,
    borderError: 'rgb(139 60 60)',
    iconBgHover: 'rgb(81 81 81 / 50%)',
    iconBgActive: 'rgb(81 81 81 / 30%)',
  },
  dropdown: {
    bg: bgDialog,
    bgSelected: themeDarkSelectedColor,
    border: borderDefault,
    borderFocused: themeDarkDefaultColor,
  },
  // Checkbox & Radio button
  chbRb: {
    bg: bgDialog,
    bgActive: themeDarkDefaultColor80,
    border: borderDefault,
    borderFocused: themeDarkDefaultColor,
    borderActive: themeDarkDefaultColor80,
  },
  tag: {
    bg: bgDialog,
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
