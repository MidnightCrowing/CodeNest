import { ipcMain } from 'electron'
import fs from 'fs-extra'

import { formatPath } from '../utils/pathUtils'

// 格式化文件路径
ipcMain.handle('path:format', (_, filePath: string): string => {
  return formatPath(filePath)
})

// 检查路径是否存在
ipcMain.handle('path:check-existence', async (_, path: string): Promise<{ exists: boolean, error?: string }> => {
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
