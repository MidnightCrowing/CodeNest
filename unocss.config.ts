import { defineConfig, presetAttributify, presetUno } from 'unocss'

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
  },
})
