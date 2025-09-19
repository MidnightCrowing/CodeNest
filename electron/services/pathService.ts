import * as os from 'node:os'

import fs from 'fs-extra'

/**
 * 将文件路径数组中的用户根目录替换为 `~`。
 *
 * @param filePath - 需要处理的文件路径数组
 * @returns 经过格式化处理的文件路径数组，如果路径以用户根目录开头，则将其替换为 `~`
 *
 * 例如：
 * - 输入: 'C:\\Users\\lenovo\\source', 'D:\\Documents\\project'
 * - 输出: '~\\source', 'D:\\Documents\\project'
 */
export function format(filePath: string): string {
  const userHomeDir = os.homedir()

  if (filePath.startsWith(userHomeDir)) {
    return filePath.replace(userHomeDir, '~')
  }
  return filePath
}

// 检查路径是否存在
export async function checkExistence(path: string) {
  try {
    const exists = await fs.pathExists(path)
    return { exists }
  }
  catch (e: any) {
    console.error('Error checking path existence:', e?.message || e)
    return { exists: false, error: e?.message || String(e) }
  }
}
