// Group
export interface Group {
  /**
   * 显示在组头部的标签文本。
   * 这是一个必填字段。
   */
  label: string

  /**
   * 标签的类型。
   * 可以是 'primary' 或 'secondary'。
   * 'primary' 会应用主样式，'secondary' 会应用次样式。
   * 这是一个可选字段，若未提供则默认为 'primary'。
   */
  labelType?: 'primary' | 'secondary'

  /**
   * 是否允许展开或折叠组。
   * 如果设置为 true，组将显示展开/折叠图标。
   * 这是一个可选字段，默认为 true。
   */
  expandable?: boolean

  /**
   * 组的初始展开状态。
   * 确定组在首次渲染时是否展开或折叠。
   * 这是一个可选字段，默认为 true（表示展开）。
   */
  isExpand?: boolean
}

// JeGroupHeader
export interface GroupHeader {
  /**
   * 分组标题的类型，用于定义分组标题的视觉样式。
   *
   * - `'primary'` 表示主要分组标题，通常用于主要分组。
   * - `'secondary'` 表示次要分组标题，适用于较低优先级的分组。
   *
   * 默认为 `'primary'`。
   */
  type?: 'primary' | 'secondary'

  foldAble?: boolean
  isFold?: boolean
}
