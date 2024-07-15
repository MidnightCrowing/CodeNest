import * as path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, Menu } from 'electron'

import { performAsyncTask } from './asyncTask.js'

// 是否是生产环境
const isPackaged = app.isPackaged

// 禁止显示默认菜单
Menu.setApplicationMenu(null)

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2b2d30',
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

  if (!isPackaged) {
    mainWindow.loadURL('http://localhost:5173/')
  }
  else {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    mainWindow.loadURL(`file://${path.join(__dirname, '../app/index.html')}`)
  }
}

app.whenReady().then(async () => {
  performAsyncTask()

  createWindow()
})
