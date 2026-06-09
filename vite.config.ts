import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

// 定义一个函数 `r`，用于解析相对路径
export const r = (...args: string[]) => resolve(dirname(fileURLToPath(import.meta.url)), ...args)

function dependencyName(id: string) {
  const normalized = id.replace(/\\/g, '/')
  const marker = '/node_modules/'
  const index = normalized.lastIndexOf(marker)
  if (index < 0)
    return undefined

  const segments = normalized.slice(index + marker.length).split('/')
  return segments[0]?.startsWith('@')
    ? `${segments[0]}/${segments[1]}`
    : segments[0]
}

export default defineConfig({
  base: './',
  root: r('src'),
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

    VueI18nPlugin({
      runtimeOnly: true, // 只使用运行时版本
      compositionOnly: true, // 只支持组合式 API
      include: [r('./src/locales/**')],
    }),

    UnoCSS(),
  ],
  server: {
    port: 3001,
    hmr: {
      host: 'localhost',
    },
    watch: {
      // 排除特定的文件夹或文件
      ignored: ['**/data/*', '**/node_modules/*'],
    },
  },
  build: {
    target: 'es2022',
    modulePreload: {
      polyfill: false,
    },
    emptyOutDir: true,
    minify: 'terser', // 使用 Terser 进行代码压缩
    outDir: r('dist'), // 是否清空输出目录
    rollupOptions: {
      input: r('src/index.html'),
      output: {
        format: 'es',
        manualChunks(id) {
          const name = dependencyName(id)
          if (!name)
            return

          if (name === 'fuse.js')
            return 'search'
          if (name === 'reka-ui')
            return 'ui'
          if (['pinia', 'vue', 'vue-i18n'].includes(name))
            return 'vue'
        },
      },
    },
    sourcemap: false, // 是否生成 source map
    terserOptions: {
      mangle: true, // 是否混淆变量名
      compress: {
        drop_console: true, // 删除 console 语句
        drop_debugger: true, // 删除 debugger 语句
      },
      format: {
        comments: false, // 是否保留注释
      },
    },
  },
})
