import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'vite'

import baseConfig, { r } from './vite.config.base'

export default defineConfig({
  ...baseConfig,

  root: r('src'),

  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      name: 'jetv-ui',
      fileName: format => `jetv-ui.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      input: r('src/index.ts'),
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: 'jetv-ui.[ext]',
      },
      plugins: [
        typescript({
          tsconfig: './tsconfig.json',
        }),
      ],
    },
    minify: 'terser',
    outDir: r('dist'),
    sourcemap: true,
    terserOptions: {
      mangle: true, // 是否混淆变量名
      compress: {
        drop_console: false, // 删除 console 语句
        drop_debugger: false, // 删除 debugger 语句
        // pure_funcs: ['console.log'], // 删除特定的函数调用，如 console.log
      },
      format: {
        comments: false, // 是否保留注释
      },
    },
  },
})
