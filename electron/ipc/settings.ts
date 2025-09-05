import * as path from 'node:path'

import { ipcMain } from 'electron'
import fs from 'fs-extra'

import { settingsFilePath } from '../utils/dataPath'
import { openLocalFile } from '../utils/pathUtils'

// 保存设置数据到本地
ipcMain.handle('settings:save', async (_, data: string): Promise<{ success: boolean, error?: string }> => {
  try {
    await fs.ensureFile(settingsFilePath) // 确保文件存在
    await fs.writeJSON(settingsFilePath, JSON.parse(data), { spaces: 2 })
    return { success: true }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving settings data:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})

// 从本地读取设置数据
ipcMain.handle('settings:load', async (): Promise<{ success: boolean, data?: string, error?: string }> => {
  try {
    const data = await fs.readJSON(settingsFilePath)
    return { success: true, data: JSON.stringify(data) }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error loading settings data:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})

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
