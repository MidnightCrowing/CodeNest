import * as path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, globalShortcut, Menu } from 'electron'

import { performAsyncTask } from './asyncTask.js'

const devUrl = 'http://localhost:5173/'
const maxRetries = 5
let retryCount = 0
let mainWindow: BrowserWindow

// 检查是否为生产环境
const isPackaged = app.isPackaged

// 禁用默认菜单
Menu.setApplicationMenu(null)

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#dfe1e5',
      height: 40,
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // 设置窗口标题
  mainWindow.setTitle('CodeNest')

  // 开发环境下, 打开开发者工具
  // if (!isPackaged) {
  //   mainWindow.webContents.openDevTools();
  // }

  // 是否是生产环境
  if (!isPackaged) {
    loadURLWithRetry(devUrl)
  }
  else {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    mainWindow.loadURL(`file://${path.join(__dirname, '../app/index.html')}`)
  }
}

// 带重试的加载URL函数
function loadURLWithRetry(url: string) {
  mainWindow.loadURL(url).catch((error: { message: any }) => {
    // eslint-disable-next-line no-console
    console.info(`Failed to load URL: ${url} with error: ${error.message}`)
    if (retryCount < maxRetries) {
    // eslint-disable-next-line no-console
      console.debug(`Retrying to load URL. Attempt ${retryCount + 1} of ${maxRetries}...`)
      setTimeout(() => {
        retryCount += 1
        loadURLWithRetry(url)
      }, 1000) // 等待 1 秒后重试
    }
    else {
      console.error(`Failed to load URL after ${maxRetries} attempts.`)
    }
  })
}

// 注册全局快捷键
function setGlobalShortcut(url: string) {
  globalShortcut.register('F5', () => {
    // eslint-disable-next-line no-console
    console.info('F5 pressed, reloading URL')
    retryCount = 0 // 重置重试计数
    loadURLWithRetry(url)
  })
}

// 应用启动时的操作
app.whenReady().then(async () => {
  performAsyncTask()
  setGlobalShortcut(devUrl)
  createWindow()
})

// 应用退出时的操作
app.on('will-quit', () => {
  globalShortcut.unregisterAll() // 注销所有快捷键
})
