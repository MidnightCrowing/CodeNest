export interface UiActionMenuItem {
  id: string
  label: string
  icon?: string
  checked?: boolean
  disabled?: boolean
  danger?: boolean
  separatorBefore?: boolean
  submenuWidth?: number
  children?: UiActionMenuItem[]
}
