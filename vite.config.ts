import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

// 定义一个函数 `r`，用于解析相对路径
export const r = (...args: string[]) => resolve(dirname(fileURLToPath(import.meta.url)), ...args)

export default defineConfig({
  base: './',
  root: r('src'),
  resolve: {
    alias: {
      '~/': `${r('src')}/`, // 设置别名 `~/` 为 `src/` 目录
    },
  },
  plugins: [
    vue(),

    AutoImport({
      dts: r('./src/auto-imports.d.ts'), // 声明文件生成位置和文件名称
      imports: ['vue'],
    }),

    VueI18nPlugin({
      runtimeOnly: true, // 只使用运行时版本
      compositionOnly: true, // 只支持组合式 API
      include: [r('./src/locales/**')],
    }),

    UnoCSS(),
  ],
  server: {
    port: 5173,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    emptyOutDir: false,
    minify: 'terser',
    outDir: r('dist/app'), // 是否清空输出目录
    rollupOptions: {
      input: r('src/index.html'),
      external: ['electron'],
      output: {
        format: 'cjs',
      },
    }, // 是否生成 source map
    sourcemap: false, // 使用 Terser 进行代码压缩
    terserOptions: {
      mangle: true, // 是否混淆变量名
      compress: {
        // drop_console: true, // 删除 console 语句
        drop_console: false, // 删除 console 语句
        // drop_debugger: true, // 删除 debugger 语句
        drop_debugger: false, // 删除 debugger 语句
        // pure_funcs: ['console.log'], // 删除特定的函数调用，如 console.log
      },
      format: {
        // comments: false, // 是否保留注释
        comments: true, // 是否保留注释
      },
    },
  },
})
