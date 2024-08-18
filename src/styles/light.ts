import { defaultTheme } from './default'
import {
  themeLightDefaultColor,
  themeLightDefaultColor80,
  themeLightSelectedColor,
} from './theme'

const bgContent = 'rgb(255 255 255)'
const bgDialog = 'rgb(242 242 242)'
const borderDefault = 'rgb(215 217 224)'

export const lightTheme = {
  window: {
    focusIn: bgDialog,
    focusOut: 'rgb(235 236 240)',
  },
  text: {
    default: defaultTheme.text.dark,
    link: themeLightDefaultColor,
    linkHover: themeLightDefaultColor80,
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
    default: themeLightDefaultColor,
    defaultActive: themeLightDefaultColor80,
    bg: bgDialog,
    bgHover: 'rgb(200 200 200 / 50%)',
    bgActive: 'rgb(200 200 200 / 30%)',
    border: borderDefault,
    borderActive: themeLightDefaultColor80,
  },
  buttonGroup: {
    bgHover: 'rgb(200 200 200 / 50%)',
    bgActive: defaultTheme.text.white,
    border: borderDefault,
    borderActive: 'rgb(179 184 198)',
  },
  field: {
    bg: defaultTheme.text.white,
    border: borderDefault,
    borderFocused: themeLightDefaultColor,
    borderError: 'rgb(220 66 81)',
    iconBgHover: 'rgb(200 200 200 / 50%)',
    iconBgActive: 'rgb(200 200 200 / 30%)',
  },
  dropdown: {
    bg: defaultTheme.text.white,
    bgSelected: themeLightSelectedColor,
    border: borderDefault,
    borderFocused: themeLightDefaultColor,
  },
  // Checkbox & Radio button
  chbRb: {
    bg: defaultTheme.text.white,
    bgActive: themeLightDefaultColor80,
    border: borderDefault,
    borderFocused: themeLightDefaultColor,
    borderActive: themeLightDefaultColor80,
  },
  tag: {
    bg: bgDialog,
    bgSelected: defaultTheme.text.white,
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
