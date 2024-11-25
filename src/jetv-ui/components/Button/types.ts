// JeButton
export interface ButtonProps {
  /**
   * 按钮的类型，用于定义按钮的视觉样式。
   *
   * - `'primary'` 表示主要按钮，通常用于主要操作或引人注目的交互。
   * - `'secondary'` 表示次要按钮，适用于较低优先级的操作。
   *
   * 默认为 `'primary'`。
   */
  type?: 'primary' | 'secondary'

  /**
   * 按钮的禁用状态。
   *
   * 如果设置为 `true`，按钮将不可点击，通常用于按钮当前不可用的情况。
   * - 默认为 `false`，表示按钮可用。
   */
  disabled?: boolean
}

// JeCheckbox
export interface CheckBoxProps {
  /**
   * 是否被选中，表示复选框当前的状态。
   * - 如果设置为 `true`，复选框将显示为已选中。
   * - 默认为 `false`，即复选框未选中。
   */
  modelValue: boolean

  /**
   * 是否为半选中状态，用于表示不确定的选中状态。
   * - 设置为 `true` 时，复选框将显示为半选状态。
   * - 默认为 `false`。
   */
  indeterminate?: boolean

  /**
   * 是否禁用复选框，使复选框不可交互。
   * - 如果设置为 `true`，复选框将显示为不可点击。
   * - 默认为 `false`。
   */
  disabled?: boolean
}

// JeCommandLinkButton
export interface CommandLinkButtonProps {
  /**
   * 图标的类名。
   * 用于为按钮添加一个图标。可以是任何有效的图标类名（如来自图标库）。
   * 如果未提供此属性，按钮将仅显示文本。
   */
  icon?: string

  /**
   * 按钮是否禁用。
   * 设置为 `true` 时，按钮将不可点击，并且通常会应用禁用状态样式。
   * 默认为 `false`，表示按钮是启用的。
   */
  disabled?: boolean
}

// JeLink
export interface LinkProps {
  onClick?: () => void

  /**
   * 链接的类型，用于定义链接的行为。
   *
   * - `'internal'` 表示内部链接，通常用于应用内导航。
   * - `'web'` 表示外部链接，通常用于跳转到外部网站。
   * - `'options'` 表示设置或配置选项链接，通常用于打开设置页面或选项。
   *
   * 默认为 `'internal'`。
   */
  type?: 'internal' | 'web' | 'options'

  /**
   * 链接的禁用状态。
   *
   * 如果设置为 `true`，链接将不可点击，通常用于当前链接不可用的情况。
   * - 默认为 `false`，表示链接可用。
   */
  disabled?: boolean
}

// JeRadio
export interface RadioProps {
  /**
   * 单选按钮的当前值，表示用户选择的选项。
   *
   * 当选中某个选项时，其 `value` 值会被赋给 `modelValue`。
   * - 可以是一个字符串或 `null`。
   */
  modelValue: string | null

  /**
   * 单选按钮的值，用于唯一标识每个单选按钮。
   *
   * - 可以是字符串或数字。
   * - 当单选按钮被选中时，此值将被传递给 `modelValue`。
   */
  value: string | number

  /**
   * 单选按钮的禁用状态。
   *
   * 如果设置为 `true`，单选按钮将不可点击，通常用于当前选项不可用的情况。
   * - 默认为 `false`，表示单选按钮可用。
   */
  disabled?: boolean
}

// JeSegmentedControl
export interface SegmentedControlProps {
  /**
   * 分段控制器的当前值，表示当前选中的选项。
   *
   * 当用户选择某个选项时，该选项的 `value` 值会被赋给 `modelValue`。
   * - 应为字符串类型，匹配 `labels` 数组中的 `value`。
   */
  modelValue: string

  /**
   * 分段选项的标签数组，包含每个选项的值和显示的标签文本。
   *
   * - 每个对象包含 `value` 和 `label` 属性。
   *   - `value`：标识该选项的唯一值，可以是字符串或数字。
   *   - `label`：显示在分段控制器上的文本，描述该选项。
   */
  labels: { value: string | number, label: string }[]

  /**
   * 分段控制器的禁用状态。
   *
   * 如果设置为 `true`，整个分段控制器将不可交互，通常用于当前选择不可更改的情况。
   * - 默认为 `false`，表示分段控制器可用。
   */
  disabled?: boolean
}

// JeSlimButton
export interface SlimButtonProps {
  /**
   * 按钮的禁用状态。
   *
   * 如果设置为 `true`，按钮将不可点击，通常用于当前操作不可用的情况。
   * - 默认为 `false`，表示按钮可用。
   */
  disabled?: boolean
}

// JeSlimTag
export interface SlimTagProps {
  /**
   * 是否可以删除该标签。
   *
   * 如果设置为 `true`，标签会显示一个删除按钮，用户可以删除该标签。
   * - 默认为 `false`。
   */
  deleteAble?: boolean

  /**
   * 是否可以选择该标签。
   *
   * 如果设置为 `true`，标签可以被选中或取消选中。
   * - 默认为 `false`。
   */
  selectAble?: boolean

  /**
   * 标签是否已被选中。
   *
   * 用于表示标签的当前选择状态。通常用于控制标签的视觉样式（如背景色）。
   * - `true` 表示选中，`false` 表示未选中。
   * - 默认为 `false`。
   */
  select?: boolean

  /**
   * 标签的禁用状态。
   *
   * - 默认为 `false`。
   */
  disabled?: boolean
}

// JeSwitch
export interface SwitchProps {
  /**
   * 开关的初始状态，默认为关闭。
   *
   * 如果设置为 `true`，表示开关处于开启状态；如果设置为 `false`，表示开关处于关闭状态。
   * - 默认为 `false`，即开关默认关闭。
   */
  modelValue: boolean

  /**
   * 开启时显示的标签。
   *
   * 该标签会在开关开启状态下显示，通常表示开关开启的含义。
   * - 如果未提供，则默认为 null。
   */
  onLabel?: string | null

  /**
   * 关闭时显示的标签。
   *
   * 该标签会在开关关闭状态下显示，通常表示开关关闭的含义。
   * - 如果未提供，则默认为 null。
   */
  offLabel?: string | null

  /**
   * 开关的禁用状态。
   *
   * 如果设置为 `true`，开关将不可点击，通常用于当前操作不可用的情况。
   *
   * 禁用状态下，用户不能切换开关。
   * - 默认为 `false`，表示开关可用。
   */
  disabled?: boolean
}

// JeTag
export interface TagProps {
  /**
   * 是否可以删除该标签。
   *
   * 如果设置为 `true`，标签会显示一个删除按钮，用户可以删除该标签。
   * - 默认为 `false`。
   */
  deleteAble?: boolean

  /**
   * 是否可以选择该标签。
   *
   * 如果设置为 `true`，标签可以被选中或取消选中。
   * - 默认为 `false`。
   */
  selectAble?: boolean

  /**
   * 标签是否已被选中。
   *
   * 用于表示标签的当前选择状态。通常用于控制标签的视觉样式（如背景色）。
   * - `true` 表示选中，`false` 表示未选中。
   * - 默认为 `false`。
   */
  select?: boolean

  /**
   * 标签的禁用状态。
   *
   * - 默认为 `false`。
   */
  disabled?: boolean
}
