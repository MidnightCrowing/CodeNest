import * as path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, globalShortcut, Menu, shell } from 'electron'

import { performAsyncTask } from './asyncTask.js'

const devUrl = 'http://localhost:5173/'
const maxRetries = 5
const windowWidth = 800
const windowHeight = 650

let mainWindow: BrowserWindow
let retryCount = 0
let isOpenDevTools = false

// 检查是否为生产环境
const isPackaged = app.isPackaged

// 禁用默认菜单
Menu.setApplicationMenu(null)

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
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

  // 是否是生产环境
  if (!isPackaged) {
    loadURLWithRetry(devUrl)
  }
  else {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    mainWindow.loadURL(`file://${path.join(__dirname, '../app/index.html')}`)
  }

  // 拦截新的窗口请求
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 在系统默认浏览器中打开 URL
    shell.openExternal(url)
    // 阻止 Electron 打开新窗口
    return { action: 'deny' }
  })
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
function setGlobalShortcut() {
  // F5: 重新加载url
  globalShortcut.register('F5', () => {
    retryCount = 0
    loadURLWithRetry(devUrl)
  })

  // F6: 重置窗口大小
  globalShortcut.register('F6', () => {
    mainWindow.setSize(windowWidth, windowHeight)
  })

  // F12: 打开开发者工具
  globalShortcut.register('F12', () => {
    if (!isOpenDevTools) {
      mainWindow.webContents.openDevTools()
      isOpenDevTools = true
    }
    else {
      mainWindow.webContents.closeDevTools()
      isOpenDevTools = false
    }
  })
}

// 应用启动时的操作
app.whenReady().then(async () => {
  performAsyncTask()
  setGlobalShortcut()
  createWindow()
})

// 拦截所有链接，并在默认浏览器中打开
app.on('web-contents-created', (e, contents) => {
  contents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
})

// 应用退出时的操作
app.on('will-quit', () => {
  globalShortcut.unregisterAll() // 注销所有快捷键
})
