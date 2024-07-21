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

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
        // 'width': '1.2em',
        // 'height': '1.2em',
      },
      collections: {
        custom: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
  ],
  shortcuts: {
    // #region text
    'head-0': 'text-[25px] font-bold',
    'head-1': 'text-[22px] font-bold',
    'head-2': 'text-[18px] font-bold',
    'head-3': 'text-[16px] font-bold lh-[20px]',
    'text-default': 'text-[13px] lh-[16px]',
    'text-paragraph': 'text-[13px] lh-[19px]',
    'text-medium': 'text-[12px] lh-[15px]',
    'text-small': 'text-[11px] lh-[14px]',
    // #endregion

    // #region button
    'btn-border': 'border-0',
    'btn-radius': 'rounded-[4px]',
    'btn-text': 'text-[13px] lh-[25px]',
    'btn-min-w': 'min-w-[72px]',
    'btn-padding': 'px-[14px]',
    'btn-bg': 'bg-$button-bg-1',
    'btn-bg-solid': 'bg-$button-bg-2 active:bg-$active-3',
    'btn-color': 'color-$text-color-2',
    'btn-color-solid': 'color-$text-color-1',
    'btn-outline': 'outline outline-[2px] outline-$border-1 active:outline-$border-2',
    'btn-base': 'btn-border btn-radius btn-text btn-min-w btn-padding',

    'button': 'btn-base btn-bg btn-color btn-outline',
    'button-solid': 'btn-base btn-bg-solid btn-color-solid',
    // #endregion

    // #region hr
    'hr': 'border-0 h-1px bg-$border-line',
    // #endregion
  },

  // #region unocss滚动条支持: https://github.com/unocss/unocss/issues/295
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
  // #endregion

  transformers: [
    transformerDirectives(),
  ],
})
