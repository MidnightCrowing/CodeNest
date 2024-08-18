export interface Theme {
  window: { focusIn: string, focusOut: string }
  text: {
    default: string
    caret: string
    selection: string
    link: string
    linkHover: string
    infoPanel: string
    infoInput: string
  }
  panel: { bgDialog: string, bgContent: string }
  button: {
    bgPrimary: string
    bgSecondary: string
    bgHoverTertiary: string
    bgActivePrimary: string
    bgActiveTertiary: string
    borderPrimary: string
    borderSecondary: string
    borderActiveSecondary: string
  }
  buttonGroup: { border: string, bgActive: string, bgHover: string, borderActive: string }
  field: {
    border: string
    iconBgHover: string
    bg: string
    iconBgActive: string
    borderFocused: string
    borderError: string
  }
  dropdown: { border: string, bg: string, bgSelected: string, borderFocused: string }
  chbRb: { border: string, bgActive: string, bg: string, borderActive: string, borderFocused: string }
  tag: { border: string, bg: string, bgSelected: string, borderSelected: string }
  hr: { bg: string }
  scrollbar: { thumb: string, thumbHover: string }
}
