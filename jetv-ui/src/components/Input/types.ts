// JeCombobox
export interface JeComboboxOptionProps {
  /**
   * 选项的唯一标识值
   */
  value: string | number

  /**
   * 显示在选项中的标签文本
   * （可选，如果未提供则使用 value 作为显示内容）
   */
  label?: string

  /**
   * 标签文本的颜色，以十六进制格式指定（例如：#FFFFFF）
   * （可选）
   */
  labelColor?: `#${string}`

  /**
   * 选项前显示的图标，可以是图标类名或路径
   * （可选）
   */
  icon?: string

  /**
   * 描述性文本，用于补充标签内容的详细信息
   * （可选）
   */
  description?: string

  /**
   * 选项的点击事件回调函数
   * 若提供此函数，将在点击该选项时执行此回调
   * （可选）
   */
  onClick?: () => void

  /**
   * 是否启用文本溢出省略号样式
   * （可选，默认值为 false）
   */
  ellipsis?: boolean

  /**
   * 是否为分隔线选项，用于在菜单中添加分隔线效果
   * （可选，默认值为 false）
   */
  isLine?: boolean
}

export interface JeComboboxProps {
  /**
   * 当前选中的值
   * 如果未选择任何值，则为 null
   */
  modelValue: string | null

  /**
   * 下拉菜单中的选项列表
   * 每个选项需符合 ComboboxOptionProps 类型
   */
  options: JeComboboxOptionProps[]

  /**
   * 是否显示加载状态
   * 如果为 true，则显示加载指示器
   * （可选，默认值为 false）
   */
  loading?: boolean

  /**
   * 是否启用拼写检查功能
   * （可选，默认值为 false）
   */
  spellcheck?: boolean

  /**
   * 是否启用验证状态
   * （可选，默认值为 false）
   */
  validated?: boolean
  validatedTooltip?: string

  /**
   * 是否禁用组件
   * 如果为 true，则组件处于不可交互状态
   * （可选，默认值为 false）
   */
  disabled?: boolean
}

// JeDropdown
export interface JeDropdownOptionProps {
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

  labelColor?: `#${string}`

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

export interface JeDropdownOptionGroupProps {
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
  options: JeDropdownOptionProps[]

  isExpand?: boolean
}

export interface JeDropdownProps {
  /**
   * 当前选择的值。
   *
   * 用于控制下拉菜单的选中状态，通常与 `options` 数组中的 `value` 对应。
   */
  modelValue: string | null

  /**
   * 下拉菜单的选项列表。
   *
   * 是一个包含多个 `DropdownOption` 类型的数组，每个选项代表一个下拉菜单项。
   */
  options: (JeDropdownOptionProps | JeDropdownOptionGroupProps)[]

  /**
   * 是否正在加载中。
   *
   * 如果设置为 `true`，表示下拉菜单正在加载数据，通常用于显示加载状态。
   */
  loading?: boolean

  /**
   * 选中项的验证状态。
   *
   * 如果为 `true`，表示尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  validatedTooltip?: string

  /**
   * 是否禁用下拉菜单。
   *
   * 如果设置为 `true`，下拉菜单将不可交互，用户无法选择任何选项。
   */
  disabled?: boolean
}

// JeFileInputField
export interface JeFileInputFieldProps {
  /**
   * 文件输入字段的当前值，用于表示所选文件的路径或文件名。
   *
   * 当用户选择文件时，该值会更新为所选文件的路径或标识信息。
   */
  modelValue: string | null

  /**
   * 选择模式：文件夹或文件
   * - 默认为 'folder'
   */
  mode?: 'folder' | 'file'

  /**
   * 对话框标题
   */
  dialogTitle?: string

  /**
   * 在文件模式下可选的文件类型过滤器。
   * 仅当 selectType 为 'file' 时生效，将透传给 openFileDialog 以限制可选扩展名。
   * 例如：[{ name: 'JSON', extensions: ['json'] }]
   */
  fileTypes?: { name: string, extensions: string[] }[]

  /**
   * 文件输入字段的验证状态。
   *
   * 如果为 `true`，表示所选文件尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  validatedTooltip?: string

  /**
   * 文件输入字段的禁用状态。
   *
   * 如果设置为 `true`，文件输入字段将不可交互，通常用于当前文件选择不可用的情况。
   * - 默认为 `false`，表示文件输入字段可用。
   */
  disabled?: boolean
}

// JeInputField
export interface JeInputFieldProps {
  /**
   * 输入字段的当前值，用于表示用户输入的内容。
   *
   * 当用户输入时，该值会随之更新，以反映输入的文本内容。
   */
  modelValue: string | null

  /**
   * 输入字段的验证状态。
   *
   * 如果为 `true`，表示输入内容尚未验证或验证未通过。
   * - 默认为 `false`
   */
  validated?: boolean

  validatedTooltip?: string

  /**
   * 输入字段的禁用状态。
   *
   * 如果设置为 `true`，输入字段将不可交互，通常用于当前输入不可用的情况。
   * - 默认为 `false`，表示输入字段可用。
   */
  disabled?: boolean

  isReadonly?: boolean

  tabindex?: number
}

// JeSearchField
export interface JeSearchFieldProps {
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
export interface JeToolbarDropdownOptionProps {
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

export interface JeToolbarDropdownProps {
  modelValue: string | number

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
  options: JeToolbarDropdownOptionProps[]

  /**
   * 是否禁用下拉菜单。
   *
   * 如果设置为 `true`，下拉菜单将不可交互，用户无法选择任何选项。
   * 该属性用于控制下拉菜单的可用状态。
   */
  disabled?: boolean
}
