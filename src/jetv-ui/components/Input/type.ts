// JeDropdown
export interface DropdownOption {
  /**
   * 选项的值。
   *
   * 用于表示选项的具体内容，通常为字符串或数字。
   * 该值可以作为选项的唯一标识符。
   */
  value: string | number

  /**
   * 选项的显示文本。
   *
   * 用于表示选项的可读内容，通常为字符串。
   * 如果没有提供该属性，可能会显示 `value` 或其他默认文本。
   */
  label?: string

  /**
   * 选项的图标。
   *
   * 可选的属性，通常用于显示在菜单项前面以增强视觉提示。
   * 该属性的值可以是图标类名或图标组件的名称。
   */
  icon?: string

  /**
   * 选项的描述信息。
   *
   * 可选的属性，通常用于提供更多的上下文信息或解释。
   * 该描述通常会在菜单项旁边显示，或在鼠标悬停时显示。
   */
  description?: string

  /**
   * 点击选项时触发的回调函数。
   *
   * 如果提供了 `onClick` 回调，当用户点击该选项时会执行此函数。
   */
  onClick?: () => void

  /**
   * 是否显示省略号。
   *
   * 如果设置为 `true`，表示选项文本在过长时会自动显示省略号。
   */
  ellipsis?: boolean

  /**
   * 是否为分割线。
   *
   * 如果设置为 `true`，该选项会被渲染为分隔线，通常用于将菜单项分成不同的组。
   * 当 `isLine` 为 `true` 时，其他属性（如 `label`, `icon` 等）会被忽略。
   */
  isLine?: boolean
}

export interface DropdownOptionGroup {
  /**
   * 索引，用于唯一标识选项组。
   *
   * 在渲染和排序时用于区分不同的组。
   */
  value: string | number

  /**
   * 组标签，用于显示在选项组的标题位置。
   *
   * 该标签通常用于描述组内选项的类别或用途。
   */
  groupLabel: string

  /**
   * 选项列表，包含该组中的所有 `Option` 项目。
   *
   * 每个选项代表该组内的一个菜单项，支持子菜单和图标等属性。
   */
  options: DropdownOption[]
}

export interface Dropdown {
  /**
   * 当前选择的值。
   *
   * 用于控制下拉菜单的选中状态，通常与 `options` 数组中的 `value` 对应。
   */
  modelValue: string

  /**
   * 下拉菜单的选项列表。
   *
   * 是一个包含多个 `DropdownOption` 类型的数组，每个选项代表一个下拉菜单项。
   */
  options: (DropdownOption | DropdownOptionGroup)[]

  /**
   * 选中项的验证状态。
   *
   * 如果为 `true`，表示尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  /**
   * 是否禁用下拉菜单。
   *
   * 如果设置为 `true`，下拉菜单将不可交互，用户无法选择任何选项。
   */
  disabled?: boolean
}

// JeFileInputField
export interface FileInputField {
  /**
   * 文件输入字段的当前值，用于表示所选文件的路径或文件名。
   *
   * 当用户选择文件时，该值会更新为所选文件的路径或标识信息。
   */
  modelValue: string

  /**
   * 文件输入字段的验证状态。
   *
   * 如果为 `true`，表示所选文件尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  /**
   * 文件输入字段的禁用状态。
   *
   * 如果设置为 `true`，文件输入字段将不可交互，通常用于当前文件选择不可用的情况。
   * - 默认为 `false`，表示文件输入字段可用。
   */
  disabled?: boolean
}

// JeInputField
export interface InputField {
  /**
   * 输入字段的当前值，用于表示用户输入的内容。
   *
   * 当用户输入时，该值会随之更新，以反映输入的文本内容。
   */
  modelValue: string

  /**
   * 输入字段的验证状态。
   *
   * 如果为 `true`，表示输入内容尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  /**
   * 输入字段的禁用状态。
   *
   * 如果设置为 `true`，输入字段将不可交互，通常用于当前输入不可用的情况。
   * - 默认为 `false`，表示输入字段可用。
   */
  disabled?: boolean
}

// JeSearchField
export interface SearchField {
  /**
   * 搜索字段的当前值，用于表示用户输入的搜索关键词。
   *
   * 当用户在搜索字段中输入内容时，该值会随之更新，以反映输入的搜索词。
   */
  modelValue: string

  /**
   * 搜索字段的类型，用于定义搜索字段的显示位置或用途。
   *
   * - `'default'` 表示普通搜索字段，通常用于标准的搜索输入区域。
   * - `'in-editor'` 表示嵌入在编辑器中的搜索字段，适用于编辑器内的搜索操作。
   *
   * 默认为 `'default'`。
   */
  type?: 'default' | 'in-editor'

  /**
   * 搜索字段的验证状态。
   *
   * 如果为 `true`，表示输入内容尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  /**
   * 搜索字段的禁用状态。
   *
   * 如果设置为 `true`，搜索字段将不可交互，通常用于当前搜索不可用的情况。
   * - 默认为 `false`，表示搜索字段可用。
   */
  disabled?: boolean
}

// JeToolbarDropdown
export interface ToolbarDropdownOption {
  /**
   * 选项的值。
   *
   * 用于表示选项的具体内容，通常为字符串或数字。
   * 该值可以作为选项的唯一标识符。
   */
  value: string | number

  /**
   * 选项的显示文本。
   *
   * 用于表示选项的可读内容，通常为字符串。
   * 如果没有提供该属性，可能会显示 `value` 或其他默认文本。
   */
  label?: string

  /**
   * 点击选项时触发的回调函数。
   *
   * 如果提供了 `onClick` 回调，当用户点击该选项时会执行此函数。
   */
  onClick?: () => void

  /**
   * 是否显示省略号。
   *
   * 如果设置为 `true`，表示选项文本在过长时会自动显示省略号。
   */
  ellipsis?: boolean

  /**
   * 是否为分割线。
   *
   * 如果设置为 `true`，该选项会被渲染为分隔线，通常用于将菜单项分成不同的组。
   * 当 `isLine` 为 `true` 时，其他属性（如 `label`, `icon` 等）会被忽略。
   */
  isLine?: boolean
}

export interface ToolbarDropdown {
  /**
   * 下拉菜单的标签文本。
   *
   * 该文本通常会显示在下拉菜单前，标识该下拉菜单的功能或用途。
   */
  label: string

  /**
   * 下拉菜单的选项列表。
   *
   * 是一个包含多个 `ToolbarDropdownOption` 类型的数组，每个选项代表一个下拉菜单项。
   * 该数组用于填充下拉菜单的所有可选项。
   */
  options: ToolbarDropdownOption[]

  /**
   * 默认选中的值。
   *
   * 用于设置下拉菜单初始时显示的选项，通常为 `options` 中某个选项的 `value`。
   * 该值可以是字符串或数字，表示下拉菜单选项的唯一标识符。
   */
  defaultSelectedValue: string | number

  /**
   * 是否禁用下拉菜单。
   *
   * 如果设置为 `true`，下拉菜单将不可交互，用户无法选择任何选项。
   * 该属性用于控制下拉菜单的可用状态。
   */
  disabled?: boolean
}
