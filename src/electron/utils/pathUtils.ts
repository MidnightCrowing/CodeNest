import * as os from 'node:os'

import { shell } from 'electron'
import fs from 'fs-extra'

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
export function formatPaths(filePaths: string[]): string[] {
  const userHomeDir = os.homedir()

  return filePaths.map((filePath) => {
    if (filePath.startsWith(userHomeDir)) {
      return filePath.replace(userHomeDir, '~')
    }
    return filePath
  })
}

/**
 * 使用系统默认方式打开指定文件
 * @param filePath - 要打开的文件路径
 * @returns 是否成功打开
 */
export function openLocalFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    return false
  }
  try {
    shell.openPath(filePath) // 使用系统默认应用打开文件
    return true
  }
  catch (error) {
    console.error(`Failed to open file: ${filePath}`, error)
    return false
  }
}
