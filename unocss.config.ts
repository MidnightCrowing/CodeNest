import { defineConfig, presetAttributify, presetIcons, presetTypography, presetUno, transformerDirectives } from 'unocss'

import { editorIconClasses } from './src/constants/codeEditor'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      collections: {
        jet: () => import('./jetv-ui/jet-icons.json').then(i => i.default),
        custom: () => import('./src/assets/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  safelist: editorIconClasses,
  transformers: [transformerDirectives()],
})
