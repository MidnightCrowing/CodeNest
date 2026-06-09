export type UiActionMenuShortcut = string | string[]

export interface UiActionMenuItem {
  id: string
  label: string
  icon?: string
  trailingIcon?: string
  shortcut?: UiActionMenuShortcut
  checked?: boolean
  disabled?: boolean
  danger?: boolean
  separatorBefore?: boolean
  submenuWidth?: number
  children?: UiActionMenuItem[]
}
