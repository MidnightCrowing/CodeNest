// JeShortcut
export interface JeShortcutProps {
  /**
   * 快捷键的样式类型（可选）。
   *
   * - `'default'`：默认样式，通常用于显示标准的快捷键样式。
   * - `'outline'`：轮廓样式，通常用于显示带有边框的快捷键样式。
   * 如果未指定此属性，默认使用 `'default'` 样式。
   */
  type?: 'default' | 'outline'

  /**
   * 快捷键的按键列表。
   *
   * 一个字符串数组，表示一组快捷键的组合。例如，`['Ctrl', 'S']` 表示 `Ctrl + S` 快捷键。
   * 快捷键的组合可以是多个键，按键之间用空格隔开，如 `['Ctrl', 'Alt', 'Del']`。
   */
  keys: string[]
}
