import { ipcMain } from 'electron'
import fs from 'fs-extra'

import type { DataFileEnum } from '../utils/dataPath'
import { getDataFilePath } from '../utils/dataPath'

// 保存数据到指定的 JSON 文件
ipcMain.handle('data:save', async (_, fileType: DataFileEnum, data: string): Promise<{ success: boolean, error?: string }> => {
  const filePath = getDataFilePath(fileType)
  try {
    await fs.ensureFile(filePath) // 确保文件存在
    await fs.writeJSON(filePath, JSON.parse(data), { spaces: 2 })
    return { success: true }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving data:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})

// 从指定的 JSON 文件加载数据
ipcMain.handle('data:load', async (_, fileType: DataFileEnum): Promise<{ success: boolean, data?: string, error?: string }> => {
  const filePath = getDataFilePath(fileType)
  try {
    const data = await fs.readJSON(filePath)
    return { success: true, data: JSON.stringify(data) }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error loading data:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})

// 删除指定的 JSON 文件
ipcMain.handle('data:delete', async (_, fileType: DataFileEnum): Promise<{ success: boolean, error?: string }> => {
  const filePath = getDataFilePath(fileType)
  try {
    await fs.remove(filePath)
    return { success: true }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting data file:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})
