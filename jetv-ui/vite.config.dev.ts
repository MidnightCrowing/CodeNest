import { defineConfig } from 'vite'

import baseConfig, { r } from './vite.config.base'

export default defineConfig({
  ...baseConfig,

  root: r('gallery'),
  server: {
    port: 3000,
  },
})
