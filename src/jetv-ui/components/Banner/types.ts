// JeBanner
export interface BannerActionProps {
  /**
   * 动作的标签文本，用于描述该动作的作用。
   *
   * 该标签通常显示在按钮或链接旁，帮助用户了解动作的目的。
   */
  label?: string

  /**
   * 点击事件处理函数。
   *
   * 在用户点击按钮或链接时触发，执行对应的操作。
   */
  onClick: () => void
}

export interface BannerProps {
  /**
   * 横幅的标签文本，用于描述横幅的主要内容。
   *
   * 该标签通常显示在横幅上，帮助用户了解横幅的消息。
   */
  label: string

  /**
   * 横幅的状态，用于定义横幅的视觉样式和用途。
   *
   * - `'info'` 表示信息提示，通常用于传达一般信息。
   * - `'success'` 表示成功提示，通常用于通知成功的操作。
   * - `'warning'` 表示警告提示，通常用于提醒潜在问题。
   * - `'error'` 表示错误提示，通常用于通知操作失败或出错。
   */
  state: 'info' | 'success' | 'warning' | 'error'

  /**
   * 横幅的操作列表，包含可供用户选择的操作。
   *
   * - 可以是 `JeAction` 对象的数组，表示多个可交互操作。
   * - 默认为空数组，表示没有附加的操作。
   */
  actions?: BannerActionProps[]

  /**
   * 横幅的类型，用于定义横幅的显示方式。
   *
   * - `'default'` 表示标准横幅，通常占据较大显示区域。
   * - `'inline'` 表示内联横幅，通常嵌入在内容中。
   *
   * 默认为 `'default'`。
   */
  type?: 'default' | 'inline'
}
