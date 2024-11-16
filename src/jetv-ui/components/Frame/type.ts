// JeFrame
export interface Frame {
  /**
   * 设置框架背景颜色的类型。
   *
   * - `'primary'` 表示主颜色，通常用于强调主要内容或操作。
   * - `'secondary'` 表示次颜色，通常用于辅助内容或次要操作。
   * - `null` 表示自定义颜色，可以通过其他样式覆盖来定义具体的背景颜色。
   *
   * 默认为 `'primary'`。
   */
  type?: 'primary' | 'secondary' | null
}
