import { colorResolver } from '@unocss/preset-mini/utils'
import { defineConfig, presetAttributify, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  shortcuts: {
    'head-0': 'text-[25px] font-bold',
    'head-1': 'text-[22px] font-bold',
    'head-2': 'text-[18px] font-bold',
    'head-3': 'text-[16px] font-bold lh-[20px]',
    'text-default': 'text-[13px] lh-[16px]',
    'text-paragraph': 'text-[13px] lh-[19px]',
    'text-medium': 'text-[12px] lh-[15px]',
    'text-small': 'text-[11px] lh-[14px]',
    'hr': 'border-0 h-1px bg-$border',
  },
  transformers: [
    transformerDirectives(),
  ],
  // unocss滚动条支持: https://github.com/unocss/unocss/issues/295
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
})
