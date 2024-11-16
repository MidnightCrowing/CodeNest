import type { Theme } from '@unocss/preset-mini'
import { colorResolver } from '@unocss/preset-mini/utils'
import type { Rule, Variant } from 'unocss'

// unocss滚动条支持: https://github.com/unocss/unocss/issues/295

export const scrollbarApplyVariants: Variant<Theme>[] = [
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
]
export const scrollbarApplyRules: Rule<Theme>[] = [
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

      const color = (res as { color: string })?.color
      const opacity = (res as { [key: string]: string })?.[opacityVarName]

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
]
