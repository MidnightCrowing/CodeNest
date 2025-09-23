import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import process from 'node:process'
import { parentPort, workerData } from 'node:worker_threads'

import type { ScanPayload } from '../services/scannerService'
import { analyzeFolder } from '../utils/linguist'
import { collectFromJetbrains } from '../utils/recent/jetbrainsRecent'
import { collectFromVscode } from '../utils/recent/vscodeRecent'

interface LangResult {
  bytes: number
  lines: { total: number, content: number, code: number }
  type: 'data' | 'markup' | 'programming' | 'prose'
  parent?: string
  color?: `#${string}`
}

interface ScanResultItem {
  path: string
  name: string
  mainLang?: string
  mainLangColor?: `#${string}`
  langGroup?: Array<{ text: string, color: `#${string}`, percentage: number }>
  ide?: string | null // CodeEditorEnum，例如 "visual-studio-code"
  error?: string
}

type WorkerMessage
  = | { type: 'item', item: ScanResultItem }
    | { type: 'done' }
    | { type: 'error', error: string }

const TYPE_PRIORITY: Record<string, number> = { programming: 1, markup: 2, data: 3, prose: 4 }

// 最大扫描字节，超过则跳过语言分析（可通过环境变量 CODENEST_MAX_SCAN_BYTES 覆盖，默认 800MB）
const MAX_SCAN_BYTES: number = Number(process.env.CODENEST_MAX_SCAN_BYTES ?? 800 * 1024 * 1024)

function sortByMainLanguage(results: Record<string, LangResult>): [string, LangResult][] {
  return Object.entries(results).sort(([aK, aV], [bK, bV]) => {
    const pa = TYPE_PRIORITY[aV.type] ?? 5
    const pb = TYPE_PRIORITY[bV.type] ?? 5
    if (pa !== pb)
      return pa - pb
    if (aV.bytes !== bV.bytes)
      return bV.bytes - aV.bytes
    return aK.localeCompare(bK)
  })
}

function toLangGroup(sortedEntries: [string, LangResult][]): Array<{ text: string, color: `#${string}`, percentage: number }> {
  if (!sortedEntries.length)
    return []
  const totalBytes = sortedEntries.reduce((sum, [, v]) => sum + v.bytes, 0) || 1
  const items = sortedEntries.map(([lang, v]) => ({
    text: lang,
    color: (v.color || '#cccccc') as `#${string}`,
    percentage: Number.parseFloat(((v.bytes / totalBytes) * 100).toFixed(2)),
  }))
  const small = items.filter(i => i.percentage < 0.5)
  const big = items.filter(i => i.percentage >= 0.5)
  if (small.length) {
    const otherPct = Number.parseFloat(small.reduce((s, i) => s + i.percentage, 0).toFixed(2))
    big.push({ text: 'Other', color: '#cccccc', percentage: otherPct })
  }
  return big
}

// 计算目录大小（包含子目录），一旦超过 cap 就提前停止并返回当前累计大小
async function getDirectorySizeCapped(dir: string, cap: number): Promise<number> {
  let total = 0

  async function walk(current: string): Promise<boolean> {
    let entries: any[] = []
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    }
    catch {
      return false
    }

    for (const de of entries) {
      const full = path.join(current, de.name)
      try {
        if (de.isDirectory()) {
          // 避免跟随符号链接，减少循环风险
          if (typeof de.isSymbolicLink === 'function' && de.isSymbolicLink())
            continue
          const exceeded = await walk(full)
          if (exceeded)
            return true
        }
        else if (de.isFile()) {
          const st = await fs.stat(full)
          total += st.size || 0
          if (total > cap)
            return true
        }
      }
      catch {
        // 忽略不可读文件或权限问题
      }
    }
    return false
  }

  const exceeded = await walk(dir)
  return exceeded ? total : total
}

async function listImmediateSubDirs(root: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(root, { withFileTypes: true })
    return entries.filter(e => e.isDirectory()).map(e => path.join(root, e.name))
  }
  catch {
    return []
  }
}

async function run() {
  const payload = workerData as ScanPayload
  const existing = new Set(payload.existingPaths)

  const dirsToScan: Set<{ path: string, ide: string | null }> = new Set()

  if (payload.rootsEnabled) {
    // 根目录扫描
    for (const root of payload.roots) {
      (await listImmediateSubDirs(root)).forEach(dir => dirsToScan.add(
        { path: dir, ide: null },
      ))
    }
  }

  if (payload.ideEnabled) {
    // IDE 最近项目扫描
    if (payload.jetbrains.enabled) {
      // JetBrains
      const cfgRoot = payload.jetbrains.configRootPath
      const results = collectFromJetbrains(cfgRoot || null)
      results.forEach(result => dirsToScan.add(
        { path: result.path, ide: result.ide },
      ))
    }
    if (payload.vscode.enabled) {
      // VSCode
      const dbPath = payload.vscode.stateDbPath
      const results = collectFromVscode(dbPath || null)
      results.forEach(result => dirsToScan.add(
        { path: result.path, ide: 'visual-studio-code' },
      ))
    }
  }

  try {
    for (const { path: full, ide } of dirsToScan) {
      if (existing.has(full))
        continue
      const name = path.basename(full) || 'Unnamed Project'
      try {
        // 在进行语言分析前，先测量目录大小，超过阈值则跳过分析
        const dirSize = await getDirectorySizeCapped(full, MAX_SCAN_BYTES)
        if (dirSize > MAX_SCAN_BYTES) {
          parentPort?.postMessage({ type: 'item', item: { path: full, name, ide } } satisfies WorkerMessage)
          continue
        }

        const analyzed = await analyzeFolder(full)
        const entries = Object.entries(analyzed.languages.results)
        if (!entries.length) {
          parentPort?.postMessage({ type: 'item', item: { path: full, name, ide } } satisfies WorkerMessage)
          continue
        }
        const sorted = sortByMainLanguage(Object.fromEntries(entries))
        const mainLang = sorted[0]?.[0]
        const mainLangColor = sorted[0]?.[1]?.color as `#${string}` | undefined
        const langGroup = toLangGroup(sorted)
        parentPort?.postMessage({ type: 'item', item: { path: full, name, mainLang, mainLangColor, langGroup, ide } } satisfies WorkerMessage)
      }
      catch (e: any) {
        parentPort?.postMessage({ type: 'item', item: { path: full, name, error: e?.message || String(e) } } satisfies WorkerMessage)
      }
    }
    parentPort?.postMessage({ type: 'done' } satisfies WorkerMessage)
  }
  catch (e: any) {
    parentPort?.postMessage({ type: 'error', error: e?.message || String(e) } satisfies WorkerMessage)
  }
}

run()
