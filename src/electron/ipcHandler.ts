import * as os from 'node:os'

import { dialog, ipcMain } from 'electron'

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

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'], // 只能选择文件夹
  })
  return formatPaths(result.filePaths)
})
