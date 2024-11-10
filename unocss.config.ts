import type { Theme as UnoTheme } from '@unocss/preset-mini'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
} from 'unocss'

import { appIconClasses } from './src/constants/appOptions'
import { commonStyle } from './src/styles/themes/common'
import { darkTheme } from './src/styles/themes/dark'
import { lightTheme } from './src/styles/themes/light'
import { scrollbarApplyRules, scrollbarApplyVariants } from './src/styles/unocss/scrollbarApply'
import shortcutsStaticStyle from './src/styles/unocss/shortcutsStatic'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      collections: {
        jet: () => import('./jet-icons/jet-icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: [
    // 静态样式
    shortcutsStaticStyle,

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
  ],
  safelist: [...appIconClasses],
  theme: {
    colors: {
      common: commonStyle,
      light: lightTheme,
      dark: darkTheme,
    },
  } as unknown as UnoTheme,
  variants: [...scrollbarApplyVariants],
  rules: [...scrollbarApplyRules],
  transformers: [transformerDirectives()],
})
