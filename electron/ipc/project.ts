import { exec } from 'node:child_process'
import path from 'node:path'

import { dialog, ipcMain } from 'electron'
import fs from 'fs-extra'
import trash from 'trash'

import { projectsFilePath } from '../utils/dataPath'
import type { LinguistResult } from '../utils/linguist'
import { analyzeFolder } from '../utils/linguist'

// 传入项目根目录，获取项目各编程语言的占比
ipcMain.handle('project:analyze', async (_, folderPath): Promise<LinguistResult | { error: string }> => {
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

// 保存数据到本地
ipcMain.handle('project:save-data', async (_, data: string): Promise<{ success: boolean, error?: string }> => {
  try {
    await fs.ensureFile(projectsFilePath) // 确保文件存在
    await fs.writeJSON(projectsFilePath, JSON.parse(data), { spaces: 2 })
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
ipcMain.handle('project:load-data', async (): Promise<{ success: boolean, data?: string, error?: string }> => {
  try {
    const data = await fs.readJSON(projectsFilePath)
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

// 使用IDE打开项目
ipcMain.handle('project:open', async (_, idePath: string, projectPath: string): Promise<string> => {
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

// 删除项目
ipcMain.handle('project:delete', async (_, projectPath: string) => {
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
ipcMain.handle('project:import', async () => {
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
    await fs.copy(importedFilePath, projectsFilePath)

    return { success: true, message: 'Data file imported successfully' }
  }
  catch (error) {
    console.error('Error importing data file:', error)
    return { success: false, message: 'Failed to import data file' }
  }
})

// 导出数据
ipcMain.handle('project:export', async () => {
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
    await fs.copy(projectsFilePath, exportedFilePath)

    return { success: true, message: 'Data file exported successfully' }
  }
  catch (error) {
    console.error('Error exporting data file:', error)
    return { success: false, message: 'Failed to export data file' }
  }
})
