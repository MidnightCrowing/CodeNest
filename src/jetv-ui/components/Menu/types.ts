// JeMenu
export interface MenuOptionProps {
  /**
   * 索引，用于唯一标识该选项。
   *
   * 可以是字符串或数字类型。
   */
  value: string | number

  /**
   * 选项标题，用于显示在菜单项中。
   *
   * 通常是简洁的文字描述。
   */
  label?: string

  labelColor?: `#${string}`

  /**
   * 选项前显示的图标。
   *
   * 可用于在菜单项前显示图标样式或图标类名，以增强视觉提示。
   */
  icon?: string

  /**
   * 选项描述，用于提供该选项的详细信息。
   *
   * 可用于鼠标悬停显示或直接在选项旁显示，通常用来解释选项的功能或用途。
   */
  description?: string

  /**
   * 按键，用于标识菜单项或选项的快捷键，通常以大写字母显示在菜单项后面。
   *
   * 例如，菜单项旁边显示的 "(A)"、"(O)" 等，表示用户可以通过按下指定的按键来触发该选项的功能。
   * - 按键通常为单个大写字母（如 'A'、'O'）。
   * - 该按键提示将显示在菜单项的后面，帮助用户了解如何通过快捷键访问该功能。
   */
  key?: string

  /**
   * 快捷键，用于设置该选项的快捷键组合。
   *
   * 快捷键组合通常由一个或多个键组成，用户可以通过按下这些键来快速触发该选项的功能。
   * - 数组中的每个元素表示一个按键，组合键例如 `['Ctrl', 'S']` 表示按下 Ctrl + S 快捷键。
   */
  shortcutKey?: string[]

  /**
   * 选项点击后的指令，定义一个回调函数。
   *
   * 当用户点击该选项时触发的操作，可以执行特定逻辑，例如导航、弹窗等。
   */
  onClick?: () => void

  /**
   * 是否显示省略号。
   *
   * 如果设置为 true，选项文本会在文本末尾显示省略号。
   */
  ellipsis?: boolean

  /**
   * 是否为分割线，标识该选项是否作为分隔线使用。
   *
   * 通常用于视觉上分隔不同的菜单项组，改善菜单布局和可读性。
   *
   * 如果设置为 `true`，此选项将呈现为分隔线，因此其他属性（除 `index`）可以忽略。
   */
  isLine?: boolean

  /**
   * 子菜单，包含一组子选项的 `Menu` 对象。
   *
   * 用于表示该选项具有子级菜单，悬停或点击该选项时显示子菜单内容。
   */
  childMenu?: MenuProps
}

export interface MenuOptionGroupProps {
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
  options: MenuOptionProps[]

  isExpand?: boolean
}

export interface MenuProps {
  visible?: boolean

  /**
   * 菜单标题，用于在菜单顶部分隔和描述菜单内容。
   *
   * 如果设置该属性，将在菜单的开头显示标题。
   */
  title?: string

  /**
   * 菜单选项列表，包含所有的 `Option` 和 `OptionGroup` 项。
   * - `Option` 表示单个菜单项，可以是普通项或分隔线。
   * - `OptionGroup` 表示一组相关的菜单项，包含多个 `Option` 项。
   */
  options: (MenuOptionProps | MenuOptionGroupProps)[]

  /** 由组件控制，不填 */
  isChildMenu?: boolean
}
