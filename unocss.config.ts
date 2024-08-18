import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
} from 'unocss'

import { commonStyle } from './src/styles/themes/common'
import { darkTheme } from './src/styles/themes/dark'
import { lightTheme } from './src/styles/themes/light'
import safelist from './src/styles/unocss/safelist'
import { scrollbarApplyRules, scrollbarApplyVariants } from './src/styles/unocss/scrollbarApply'
import shortcuts from './src/styles/unocss/shortcuts'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        custom: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
  ],
  shortcuts,
  safelist,
  theme: {
    colors: {
      common: commonStyle,
      light: lightTheme,
      dark: darkTheme,
    },
  },
  variants: [...scrollbarApplyVariants],
  rules: [...scrollbarApplyRules],
  transformers: [transformerDirectives()],
})
