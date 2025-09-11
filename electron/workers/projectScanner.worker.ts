import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { parentPort, workerData } from 'node:worker_threads'

import { analyzeFolder } from '../utils/linguist'

interface ScanPayload {
  roots: string[]
  existingPaths: string[]
}

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
  error?: string
}

type WorkerMessage
  = | { type: 'item', item: ScanResultItem }
    | { type: 'done' }
    | { type: 'error', error: string }

const TYPE_PRIORITY: Record<string, number> = { programming: 1, markup: 2, data: 3, prose: 4 }

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

  try {
    for (const root of payload.roots) {
      const dirs = await listImmediateSubDirs(root)
      for (const full of dirs) {
        if (existing.has(full))
          continue
        const name = path.basename(full) || 'Unnamed Project'
        try {
          const analyzed = await analyzeFolder(full)
          const entries = Object.entries(analyzed.languages.results)
          if (!entries.length) {
            parentPort?.postMessage({ type: 'item', item: { path: full, name } } satisfies WorkerMessage)
            continue
          }
          const sorted = sortByMainLanguage(Object.fromEntries(entries))
          const mainLang = sorted[0]?.[0]
          const mainLangColor = sorted[0]?.[1]?.color as `#${string}` | undefined
          const langGroup = toLangGroup(sorted)
          parentPort?.postMessage({ type: 'item', item: { path: full, name, mainLang, mainLangColor, langGroup } } satisfies WorkerMessage)
        }
        catch (e: any) {
          parentPort?.postMessage({ type: 'item', item: { path: full, name, error: e?.message || String(e) } } satisfies WorkerMessage)
        }
      }
    }
    parentPort?.postMessage({ type: 'done' } satisfies WorkerMessage)
  }
  catch (e: any) {
    parentPort?.postMessage({ type: 'error', error: e?.message || String(e) } satisfies WorkerMessage)
  }
}

run()
