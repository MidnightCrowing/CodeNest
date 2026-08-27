/**
 * 右键菜单图标写在 .ts 数据里，UnoCSS 的静态提取扫不到，
 * 需要在 unocss.config.ts 的 safelist 中登记，参见 editorIconClasses。
 */
export const projectMenuIcons = {
  edit: 'i-lucide:pencil',
} as const

export const projectMenuIconClasses = Object.values(projectMenuIcons)
