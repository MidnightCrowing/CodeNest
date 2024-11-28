import { dialog, ipcMain, shell } from 'electron'
import fs from 'fs-extra'

import { getMainWindow } from './main.js'
import { dataFilePath, settingsFilePath } from './utils/dataPath.js'
import type { LinguistResult } from './utils/linguist.js'
import { analyzeFolder } from './utils/linguist.js'
import { formatPaths, openLocalFile } from './utils/pathUtils.js'

// 设置主题
ipcMain.handle('set-theme', (event, theme: string): void => {
  const colorSettings = theme === 'dark'
    ? { color: '#2B2D30', symbolColor: '#DFE1E5' }
    : { color: '#F2F2F2', symbolColor: '#222323' }

  getMainWindow().setTitleBarOverlay({
    color: colorSettings.color,
    symbolColor: colorSettings.symbolColor,
  })
})

// 打开文件夹选择对话框
ipcMain.handle('open-folder-dialog', async (): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'], // 只能选择文件夹
  })
  return formatPaths(result.filePaths)
})

// 打开文件选择对话框
ipcMain.handle('open-file-dialog', async (_, fileTypes: { name: string, extensions: string[] }[] = []): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'], // 只能选择文件
    filters: fileTypes.length > 0 ? fileTypes : undefined, // 如果有文件类型，设置过滤器
  })
  return formatPaths(result.filePaths)
})

// 在系统默认浏览器中打开链接
ipcMain.handle('open-external', (_, url: string): void => {
  shell.openExternal(url)
    .then(() => {})
    .catch(err => console.error('Failed to open link:', err))
})

// 传入项目根目录，获取项目各编程语言的占比
ipcMain.handle('analyze-folder', async (_, folderPath): Promise<LinguistResult> => {
  return analyzeFolder(folderPath)
})

// 保存数据到本地
ipcMain.handle('save-project-data', async (_, data: string): Promise<{ success: boolean, error?: string }> => {
  try {
    await fs.writeJSON(dataFilePath, JSON.parse(data), { spaces: 2 })
    return { success: true }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving project data:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})

// 从本地读取数据
ipcMain.handle('load-project-data', async (): Promise<{ success: boolean, data?: string, error?: string }> => {
  try {
    const data = await fs.readJSON(dataFilePath)
    return { success: true, data: JSON.stringify(data) }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error loading project data:', error.message)
      return { success: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { success: false, error: 'Unknown error occurred' }
    }
  }
})

// 保存设置数据到本地
ipcMain.handle('save-settings-data', async (_, data: string): Promise<{ success: boolean, error?: string }> => {
  try {
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
ipcMain.handle('load-settings-data', async (): Promise<{ success: boolean, data?: string, error?: string }> => {
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
ipcMain.handle('open-settings-json', async (): Promise<boolean> => {
  if (!fs.existsSync(settingsFilePath)) {
    console.error(`Settings file not found: ${settingsFilePath}`)
    return false
  }
  return openLocalFile(settingsFilePath)
})
