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
   * 如果为 `true`，表示所选文件已通过验证。
   * - 默认为 `false`，表示尚未验证或验证未通过。
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
   * 如果为 `true`，表示输入内容已通过验证。
   * - 默认为 `false`，表示尚未验证或验证未通过。
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
   * 如果为 `true`，表示输入内容已通过验证。
   * - 默认为 `false`，表示尚未验证或验证未通过。
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
