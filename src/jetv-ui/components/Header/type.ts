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
}
