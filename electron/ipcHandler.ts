import { exec } from 'node:child_process'
import * as path from 'node:path'
import process from 'node:process'

import { dialog, ipcMain, shell } from 'electron'
import fs from 'fs-extra'
import trash from 'trash'

import { getMainWindow } from './main'
import { dataFilePath, settingsFilePath } from './utils/dataPath'
import type { LinguistResult } from './utils/linguist'
import { analyzeFolder } from './utils/linguist'
import { formatPath, openLocalFile } from './utils/pathUtils'

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
  return result.filePaths
})

// 打开文件选择对话框
ipcMain.handle('open-file-dialog', async (_, fileTypes: { name: string, extensions: string[] }[] = []): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'], // 只能选择文件
    filters: fileTypes.length > 0 ? fileTypes : undefined, // 如果有文件类型，设置过滤器
  })
  return result.filePaths
})

// 在系统默认浏览器中打开链接
ipcMain.handle('open-external', (_, url: string): void => {
  shell.openExternal(url)
    .then(() => {})
    .catch(err => console.error('Failed to open link:', err))
})

// 格式化文件路径
ipcMain.handle('format-path', (_, filePath: string): string => {
  return formatPath(filePath)
})

// 传入项目根目录，获取项目各编程语言的占比
ipcMain.handle('analyze-folder', async (_, folderPath): Promise<LinguistResult | { error: string }> => {
  try {
    const stat = await fs.stat(folderPath)

    // 检查是否是目录
    if (!stat.isDirectory()) {
      return { error: 'Provided path is not a directory' }
    }

    // 如果路径是有效的目录，继续分析
    return analyzeFolder(folderPath)
  }
  catch (error) {
    return { error: `Error checking folder path:${error}` }
  }
})

// 检查路径是否存在
ipcMain.handle('check-path-existence', async (_, path: string): Promise<{ exists: boolean, error?: string }> => {
  try {
    const exists = await fs.pathExists(path)
    return { exists }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error checking path existence:', error.message)
      return { exists: false, error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { exists: false, error: 'Unknown error occurred' }
    }
  }
})

// 保存数据到本地
ipcMain.handle('save-project-data', async (_, data: string): Promise<{ success: boolean, error?: string }> => {
  try {
    await fs.ensureFile(dataFilePath) // 确保文件存在
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

// 使用IDE打开项目
ipcMain.handle('open-project', async (_, idePath: string, projectPath: string): Promise<string> => {
  if (!idePath || !projectPath) {
    throw new Error('IDE 路径和项目路径不能为空')
  }

  // 验证路径是否正确
  if (!path.isAbsolute(idePath) || !path.isAbsolute(projectPath)) {
    throw new Error('提供的路径必须是绝对路径')
  }

  try {
    // 使用 IDE 打开项目目录
    exec(`"${idePath}" "${projectPath}"`, (error) => {
      if (error) {
        console.error('Failed to open project:', error)
        throw new Error('打开项目失败，请检查 IDE 路径和项目路径是否正确')
      }
    })

    return '项目已成功打开'
  }
  catch (err) {
    console.error(err)
    throw new Error('打开项目时发生错误')
  }
})

// 使用资源管理器打开路径
ipcMain.handle('open-in-explorer', (_, folderPath: string): void => {
  const resolvedPath = path.resolve(folderPath)
  // 使用系统默认的资源管理器打开文件夹
  shell.openPath(resolvedPath).catch((err) => {
    console.error('打开资源管理器失败:', err)
  })
})

// 使用终端打开路径
ipcMain.handle('open-in-terminal', (_, folderPath: string): void => {
  const resolvedPath = path.resolve(folderPath)
  // 根据操作系统选择合适的终端命令
  const isWindows = process.platform === 'win32'
  const isMac = process.platform === 'darwin'
  const isLinux = process.platform === 'linux'

  if (isWindows) {
    exec(`start cmd.exe /K "cd ${resolvedPath}"`, (err) => {
      if (err) {
        console.error('打开终端失败:', err)
      }
    })
  }
  else if (isMac) {
    exec(`open -a Terminal ${resolvedPath}`, (err) => {
      if (err) {
        console.error('打开终端失败:', err)
      }
    })
  }
  else if (isLinux) {
    exec(`gnome-terminal --working-directory=${resolvedPath}`, (err) => {
      if (err) {
        console.error('打开终端失败:', err)
      }
    })
  }
  else {
    console.error('不支持的操作系统')
  }
})

// 删除项目
ipcMain.handle('delete-project', async (_, projectPath: string) => {
  try {
    if (!fs.existsSync(projectPath)) {
      throw new Error('项目路径不存在')
    }

    // 尝试将文件移动到回收站
    await trash([projectPath])

    return { success: true, message: '项目已移至回收站' }
  }
  catch (error) {
    console.error('删除项目失败:', error)

    // 如果无法移至回收站，则尝试直接删除
    try {
      const stats = fs.lstatSync(projectPath)

      if (stats.isDirectory()) {
        fs.rmSync(projectPath, { recursive: true, force: true })
      }
      else {
        fs.unlinkSync(projectPath)
      }

      return { success: true, message: '项目已直接删除' }
    }
    catch (deleteError: any) {
      console.error('直接删除失败:', deleteError)
      return { success: false, message: '删除项目失败', error: (deleteError as Error).message }
    }
  }
})

// 导入数据
ipcMain.handle('import-data', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePaths.length) {
      return { success: false, message: 'No file selected for import' }
    }

    const importedFilePath = result.filePaths[0]

    // 将选中的文件复制到默认数据路径
    await fs.copy(importedFilePath, dataFilePath)

    return { success: true, message: 'Data file imported successfully' }
  }
  catch (error) {
    console.error('Error importing data file:', error)
    return { success: false, message: 'Failed to import data file' }
  }
})

// 导出数据
ipcMain.handle('export-data', async () => {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: 'projects.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePath) {
      return { success: false, message: 'No file path selected for export' }
    }

    const exportedFilePath = result.filePath

    // 复制程序内部的 `data.json` 文件到用户选择的路径
    await fs.copy(dataFilePath, exportedFilePath)

    return { success: true, message: 'Data file exported successfully' }
  }
  catch (error) {
    console.error('Error exporting data file:', error)
    return { success: false, message: 'Failed to export data file' }
  }
})

// 打开设置 JSON 文件
ipcMain.handle('open-settings-json', async (): Promise<boolean> => {
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
