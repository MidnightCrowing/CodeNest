import type { Theme } from '@unocss/preset-mini'
import type { UserShortcuts } from 'unocss'

import staticStyle from './shortcutsStatic'

const shortcuts: UserShortcuts<Theme> = [
  // 静态样式
  staticStyle,

  // 颜色，将 `-theme-` 转换成 `-light-` 和 `-dark-` 的组合
  [/^(.*)-theme-(.*)$/, ([, prefix, themeColor]) =>
    `${prefix}-light-${themeColor} dark:${prefix}-dark-${themeColor}`],
  // 标题样式，根据输入是否包含 "thin" 来决定是否添加 font-bold 类
  [/^head-(\d+)(-thin)?$/, ([, head, thin]) =>
    thin
      ? `head-${head}-default font-bold`
      : `head-${head}-default`],
  // 图标, 随暗色模式改变
  [/^i-mode-(.*?)(\?mask)?$/, ([, icon, mask]) =>
    mask
      ? `i-custom-${icon}${mask} dark:i-custom-${icon}_dark${mask}`
      : `i-custom-${icon} dark:i-custom-${icon}_dark`],
  // 图标, 不随暗色模式改变
  [/^i-static-(.*?)(\?mask)?$/, ([, icon, mask]) =>
    mask
      ? `i-custom-${icon}${mask}`
      : `i-custom-${icon}`],
]

export default shortcuts
