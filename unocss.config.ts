import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { colorResolver } from '@unocss/preset-mini/utils'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
} from 'unocss'

import styles from './src/styles/unocssStyle'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        // 'width': '1.2em',
        // 'height': '1.2em',
      },
      collections: {
        custom: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
  ],
  shortcuts: styles.shortcuts,

  // region unocss滚动条支持: https://github.com/unocss/unocss/issues/295
  variants: [
    (matcher) => {
      const matches = matcher.match(
        /^(resizer|scrollbar(?:-(?:thumb|track(?:-piece)?|button|corner))?):/,
      )
      if (!matches) {
        return matcher
      }
      return {
        matcher: matcher.slice(matches[0].length),
        selector: s => `${s}::-webkit-${matches[1]}`,
      }
    },
  ],
  rules: [
    [
      /^scroll(?:bar)?-(thin|none|auto)$/,
      ([, w]) => ({
        'scrollbar-width': w,
      }),
    ],
    [
      /^scroll(?:bar)?-(track|thumb)-(.+)$/,
      async ([s, section, colorMatch], context) => {
        const varName = `scroll${section}-bg`
        const opacityVarName = `--un-${varName}-opacity`
        const colorVarName = `--un-${varName}`
        const res = await colorResolver('color', varName)([s, colorMatch], context)

        if (!res) {
          return
        }

        // eslint-disable-next-line dot-notation
        const color = res['color']
        const opacity = res[opacityVarName]

        if (!color) {
          return
        }

        if (opacity) {
          return {
            [opacityVarName]: opacity,
            [colorVarName]: color,
            'scrollbar-color': 'var(--un-scrollthumb-bg) var(--un-scrolltrack-bg)',
          }
        }

        return {
          [colorVarName]: color,
          'scrollbar-color': 'var(--un-scrollthumb-bg) var(--un-scrolltrack-bg)',
        }
      },
    ],
  ],
  // endregion

  transformers: [transformerDirectives()],
})
