import * as path from 'node:path'

import { ipcMain } from 'electron'
import fs from 'fs-extra'

import { settingsFilePath } from '../utils/dataPath'
import { openLocalFile } from '../utils/pathUtils'

// 打开设置 JSON 文件
ipcMain.handle('settings:open-json', async (): Promise<boolean> => {
  try {
    // 如果文件不存在，创建一个新的 JSON 文件
    if (!fs.existsSync(settingsFilePath)) {
      console.warn(`Settings file not found. Creating new file at: ${settingsFilePath}`)

      // 创建文件夹路径（如果不存在）
      const dir = path.dirname(settingsFilePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // 创建一个默认设置文件
      fs.writeFileSync(settingsFilePath, JSON.stringify({}), 'utf8')
    }

    // 打开文件
    return openLocalFile(settingsFilePath)
  }
  catch (error) {
    console.error(`Failed to open or create settings file: ${error}`)
    return false
  }
})
