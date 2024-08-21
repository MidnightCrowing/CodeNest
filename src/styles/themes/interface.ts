export interface Theme {
  // Text related styles
  text: {
    default: string
    caret: string // 光标颜色
    selection: string
    link: string
    linkHover: string
    infoPanel: string // Inline help, shortcuts
    infoInput: string // Additional information in lists (paths, counters), placeholder
  }

  // Panel styles
  panel: {
    bgDialog: string
    bgContent: string
  }

  // Button styles
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

  // Button group styles
  buttonGroup: {
    bgHover: string
    bgActive: string
    border: string
    borderActive: string
  }

  // Field styles
  field: {
    bg: string
    border: string
    borderFocused: string
    borderError: string
    iconBgHover: string
    iconBgActive: string
  }

  // Dropdown styles
  dropdown: {
    bg: string
    bgSelected: string
    border: string
    borderFocused: string
    borderError: string
  }

  // Checkbox & Radio button styles
  chbRb: {
    bg: string
    bgActive: string
    border: string
    borderActive: string
    borderFocused: string
  }

  // Tag styles
  tag: {
    bgUnselectable: string
    bgSelectable: string
    bgSelected: string
    border: string
    borderSelected: string
  }

  // Horizontal rule style
  hr: {
    bg: string
  }

  // Scrollbar styles
  scrollbar: {
    thumb: string
    thumbHover: string
  }

  // Window focus styles
  window: {
    focusIn: string
    focusOut: string
  }
}
