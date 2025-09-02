import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

// 定义一个函数 `r`，用于解析相对路径
export const r = (...args: string[]) => resolve(dirname(fileURLToPath(import.meta.url)), ...args)

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '~/': `${r('src')}/`, // 设置别名 `~/` 为 `src/` 目录
    },
  },

  // 设置scss的api类型为modern-compiler https://blog.csdn.net/CssHero/article/details/142686148
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },

  plugins: [
    vue(),

    AutoImport({
      dts: r('./src/auto-imports.d.ts'), // 声明文件生成位置和文件名称
      imports: ['vue'],
    }),

    UnoCSS(),
  ],
})
