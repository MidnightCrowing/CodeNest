export interface JeTabsProps {
  /**
   * 当前激活的标签 value。
   */
  modelValue: string | number
  /**
   * 全局是否可关闭（TabPane 未单独指定 closable 时使用）。
   */
  closable?: boolean
  /**
   * 是否显示新增按钮。
   */
  addable?: boolean
  /**
   * 是否允许水平滚动（标签过多时）。默认 true。
   */
  scrollable?: boolean
}

export interface JeTabPaneProps {
  /** 唯一值 */
  value: string | number
  /** 标签标题 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可关闭（优先级高于 Tabs.closable） */
  closable?: boolean
  /** 图标类名（可选） */
  icon?: string
  /** 懒加载，仅首次激活渲染 */
  lazy?: boolean
}
