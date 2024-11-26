import * as os from 'node:os'
import { resolve } from 'node:path'

import { dialog, ipcMain, shell } from 'electron'
import fs from 'fs-extra'

import { getMainWindow } from './main.js'
import { dataPath } from './utils/dataPath.js'
import type { LinguistResult } from './utils/linguist.js'
import { analyzeFolder } from './utils/linguist.js'

const dataFilePath = resolve(dataPath, 'projects.json')

/**
 * 将文件路径数组中的用户根目录替换为 `~`。
 *
 * @param filePaths - 需要处理的文件路径数组
 * @returns 经过格式化处理的文件路径数组，如果路径以用户根目录开头，则将其替换为 `~`
 *
 * 例如：
 * - 输入: ['C:\\Users\\lenovo\\source', 'D:\\Documents\\project']
 * - 输出: ['~\\source', 'D:\\Documents\\project']
 */
function formatPaths(filePaths: string[]): string[] {
  const userHomeDir = os.homedir()

  return filePaths.map((filePath) => {
    if (filePath.startsWith(userHomeDir)) {
      return filePath.replace(userHomeDir, '~')
    }
    return filePath
  })
}

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

// 打开文件选择对话框
ipcMain.handle('open-folder-dialog', async (): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'], // 只能选择文件夹
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
