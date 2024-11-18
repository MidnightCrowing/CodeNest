import { defineConfig, presetAttributify, presetIcons, presetTypography, presetUno, transformerDirectives } from 'unocss'

import { editorIconClasses } from './src/constants/codeEditor'
import { scrollbarApplyRules, scrollbarApplyVariants } from './src/styles/unocss/scrollbarApply'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      collections: {
        jet: () => import('./jet-icons/jet-icons.json').then(i => i.default),
        custom: () => import('./src/assets/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: {
    // Typography
    'text-h1': 'text-20px lh-24px font-semibold',
    'text-h2': 'text-16px lh-20px font-semibold',
    'text-default': 'text-13px lh-16px font-medium',
    'text-default-semibold': 'text-13px lh-16px font-semibold',
    'text-paragraph': 'text-13px lh-18px font-medium',
    'text-medium': 'text-12px lh-16px font-medium',
    'text-medium-semibold': 'text-12px lh-16px font-semibold',
    // Color
    'text-primary': 'light:color-$gray-1 dark:color-$gray-12',
    'text-secondary': 'color-$gray-7',
  },
  safelist: editorIconClasses,
  variants: scrollbarApplyVariants,
  rules: scrollbarApplyRules,
  transformers: [transformerDirectives()],
})
