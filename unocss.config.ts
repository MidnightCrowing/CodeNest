import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import { editorIconClasses } from './src/constants/codeEditor'
import { projectMenuIconClasses } from './src/constants/projectMenu'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      collections: {
        custom: () => import('./src/assets/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  safelist: [...editorIconClasses, ...projectMenuIconClasses],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
