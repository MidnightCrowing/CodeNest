import './ipcHandler.js'

import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, globalShortcut, Menu } from 'electron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEV_URL = 'http://localhost:3001/'
const MAX_RETRIES = 5
const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 650

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
    width: WINDOW_WIDTH,
    minWidth: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minHeight: WINDOW_HEIGHT,
    // eslint-disable-next-line node/prefer-global/process
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    trafficLightPosition: { x: 10, y: 10 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      sandbox: true,
      webSecurity: false,
      devTools: !isPackaged,
    },
  })

  // 设置窗口标题
  mainWindow.setTitle('CodeNest')

  // 是否是生产环境
  if (!isPackaged) {
    loadURLWithRetry(DEV_URL)
    mainWindow.webContents.openDevTools()
  }
  else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../app/index.html')}`)
      .then(() => {})
  }

  // 拦截新的窗口请求，不做任何处理
  mainWindow.webContents.setWindowOpenHandler(() => {
    // 阻止 Electron 打开新窗口
    return { action: 'deny' }
  })
}

function getMainWindow() {
  return mainWindow
}

// 带重试的加载URL函数
function loadURLWithRetry(url: string) {
  mainWindow.loadURL(url).catch((error: { message: any }) => {
    // eslint-disable-next-line no-console
    console.info(`Failed to load URL: ${url} with error: ${error.message}`)
    if (retryCount < MAX_RETRIES) {
    // eslint-disable-next-line no-console
      console.debug(`Retrying to load URL. Attempt ${retryCount + 1} of ${MAX_RETRIES}...`)
      setTimeout(() => {
        retryCount += 1
        loadURLWithRetry(url)
      }, 1000) // 等待 1 秒后重试
    }
    else {
      console.error(`Failed to load URL after ${MAX_RETRIES} attempts.`)
    }
  })
}

// 注册全局快捷键
function setGlobalShortcut() {
  // F5: 重新加载url
  if (!isPackaged) {
    globalShortcut.register('F5', () => {
      retryCount = 0
      loadURLWithRetry(DEV_URL)
    })
  }

  // F6: 重置窗口大小
  globalShortcut.register('F6', () => {
    mainWindow.setSize(WINDOW_WIDTH, WINDOW_HEIGHT)
  })

  // F11: 打开开发者工具
  globalShortcut.register('F11', () => {
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
  setGlobalShortcut()
  createWindow()
})

// 应用退出时的操作
app.on('will-quit', () => {
  globalShortcut.unregisterAll() // 注销所有快捷键
})

export { getMainWindow }
