import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import Database from 'better-sqlite3'

import { uniqExistingDirs } from './shared'

export interface VscodeRecentEntry {
  folderUri?: string
  fileUri?: string
  workspace?: { id?: string, configPath: string } | string
  label?: string
  remoteAuthority?: string
}

/**
 * 获取 VSCode 最近打开项目列表
 * @param dbPath VSCode state.vscdb 文件路径
 */
function getVscodeRecentProjects(dbPath: string): VscodeRecentEntry[] {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`VSCode state file not found: ${dbPath}`)
  }

  const db = new Database(dbPath, { readonly: true })
  try {
    const row = db
      .prepare('SELECT value FROM ItemTable WHERE key = \'history.recentlyOpenedPathsList\'')
      .get() as { value: string } | undefined

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
  finally {
    try {
      db.close()
    }
    catch {}
  }
}

function isFileUri(uri: string): boolean {
  return /^file:\/\//i.test(uri)
}

function decodeFileUriToFsPath(uri: string): string | null {
  if (!isFileUri(uri))
    return null
  try {
    // Use WHATWG URL for robust parsing
    const u = new URL(uri)
    // On Windows, URL pathname starts with /c:/...
    let p = decodeURIComponent(u.pathname)
    if (process.platform === 'win32') {
      if (p.startsWith('/'))
        p = p.slice(1)
      // Convert to backslashes
      p = p.replace(/\//g, '\\')
    }
    return p
  }
  catch {
    // Fallback: strip prefix and decode
    try {
      const raw = uri.replace(/^file:\/\//i, '')
      const decoded = decodeURIComponent(raw)
      return process.platform === 'win32' ? decoded.replace(/\//g, '\\') : `/${decoded}`
    }
    catch {
      return null
    }
  }
}

export function collectFromVscode(dbPath: string | null): { path: string, ide: string | null }[] {
  if (!dbPath)
    return []
  let entries: ReturnType<typeof getVscodeRecentProjects> = []
  try {
    entries = getVscodeRecentProjects(dbPath)
  }
  catch {
    return []
  }

  const candidates: { path: string, ide: string | null }[] = []
  for (const e of entries) {
    // Skip remote entries
    if ((e as any).remoteAuthority)
      continue

    if (e.folderUri && isFileUri(e.folderUri)) {
      const p = decodeFileUriToFsPath(e.folderUri)
      if (p)
        candidates.push({ path: p, ide: null })
      continue
    }
    if (e.workspace && typeof e.workspace === 'object') {
      const cfg = (e.workspace as any).configPath
      if (typeof cfg === 'string' && isFileUri(cfg)) {
        const p = decodeFileUriToFsPath(cfg)
        if (p)
          candidates.push({ path: path.dirname(p), ide: null })
      }
      continue
    }
    // Optional: handle fileUri by taking its directory
    if (e.fileUri && isFileUri(e.fileUri)) {
      const p = decodeFileUriToFsPath(e.fileUri)
      if (p)
        candidates.push({ path: path.dirname(p), ide: null })
    }
  }
  return uniqExistingDirs(candidates)
}
