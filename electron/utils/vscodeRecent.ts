import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import Database from 'better-sqlite3'
import { app } from 'electron'

export interface VscodeRecentEntry {
  folderUri?: string
  fileUri?: string
  workspace?: string
  label?: string
}

/**
 * 获取 VSCode 最近打开项目列表
 * @param dbPath VSCode state.vscdb 文件路径
 */
export function getVscodeRecentProjects(dbPath: string): VscodeRecentEntry[] {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`VSCode state file not found: ${dbPath}`)
  }

  const db = new Database(dbPath, { readonly: true })
  const row = db
    .prepare('SELECT value FROM ItemTable WHERE key = \'history.recentlyOpenedPathsList\'')
    .get() as { value: string }

  if (!row)
    return []

  try {
    const history = JSON.parse(row.value.toString())
    return history.entries || []
  }
  catch (e) {
    console.error('Failed to parse VSCode recent list:', e)
    return []
  }
}

/**
 * 自动检测 VSCode state.vscdb 路径
 * 全平台通用
 */
export function detectVscodeStateDbPath(): string | null {
  let dbPath: string

  switch (process.platform) {
    case 'win32':
      dbPath = path.join(app.getPath('appData'), 'Code', 'User', 'globalStorage', 'state.vscdb')
      break
    case 'darwin':
      dbPath = path.join(
        app.getPath('home'),
        'Library',
        'Application Support',
        'Code',
        'User',
        'globalStorage',
        'state.vscdb',
      )
      break
    default: // linux
      dbPath = path.join(
        app.getPath('home'),
        '.config',
        'Code',
        'User',
        'globalStorage',
        'state.vscdb',
      )
  }

  return fs.existsSync(dbPath) ? dbPath : null
}
