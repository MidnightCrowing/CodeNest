import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      include: ['src/**/*.test.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
