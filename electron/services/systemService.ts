import { exec } from 'node:child_process'
import * as path from 'node:path'
import process from 'node:process'

import { shell } from 'electron'

// 在系统默认浏览器中打开链接
export async function openExternal(url: string): Promise<void> {
  await shell.openExternal(url).catch(err => console.error('Failed to open link:', err))
}

// 使用资源管理器打开路径
export async function openInExplorer(folderPath: string): Promise<void> {
  const resolvedPath = path.resolve(folderPath)
  // 使用系统默认的资源管理器打开文件夹
  await shell.openPath(resolvedPath).catch(err => console.error('打开资源管理器失败:', err))
}

// 使用终端打开路径
export async function openInTerminal(folderPath: string): Promise<void> {
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
}
