import * as path from 'node:path'

import { ipcMain } from 'electron'
import fs from 'fs-extra'

// 获取目录下的文件夹列表
ipcMain.handle('folder:get-list', async (_, folderPath: string): Promise<{ folders: string[], error?: string }> => {
  try {
    const stat = await fs.stat(folderPath)

    // 检查是否是目录
    if (!stat.isDirectory()) {
      return { folders: [], error: 'Provided path is not a directory' }
    }

    // 读取目录内容并过滤出文件夹，返回绝对路径
    const items = await fs.readdir(folderPath)
    const folders: string[] = []

    for (const item of items) {
      const itemPath = path.join(folderPath, item)
      const itemStat = await fs.stat(itemPath)
      if (itemStat.isDirectory()) {
        folders.push(itemPath)
      }
    }

    return { folders }
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error getting folder list:', error.message)
      return { folders: [], error: error.message }
    }
    else {
      console.error('Unknown error:', error)
      return { folders: [], error: 'Unknown error occurred' }
    }
  }
})
