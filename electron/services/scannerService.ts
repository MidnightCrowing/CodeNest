import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Worker } from 'node:worker_threads'

import type { IpcMainInvokeEvent } from 'electron'
import { app } from 'electron'

interface ScanPayload {
  roots: string[]
  existingPaths: string[]
}
interface ScanResultItem {
  path: string
  name: string
  mainLang?: string
  mainLangColor?: `#${string}`
  langGroup?: Array<{ text: string, color: `#${string}`, percentage: number }>
  error?: string
}

export async function scan(payload: ScanPayload): Promise<ScanResultItem[]> {
  return new Promise((resolve, reject) => {
    try {
      // @ts-expect-error -- 知道要改tsconfig但不想改
      const workerUrl = new URL('../workers/projectScanner.worker.js', import.meta.url)
      const worker = new Worker(workerUrl, { type: 'module', workerData: payload } as any)

      const items: ScanResultItem[] = []
      const cleanup = () => worker.removeAllListeners()

      worker.on('message', (msg: any) => {
        if (msg?.type === 'item' && msg.item) {
          items.push(msg.item as ScanResultItem)
        }
        else if (msg?.type === 'done') {
          cleanup()
          resolve(items)
        }
        else if (msg?.type === 'error') {
          cleanup()
          reject(new Error(msg.error || 'scan error'))
        }
      })

      worker.once('error', (err) => {
        cleanup()
        reject(err)
      })
      worker.once('exit', (code) => {
        if (code !== 0)
          reject(new Error(`scanner worker exited with code ${code}`))
      })
    }
    catch (e) {
      reject(e)
    }
  })
}

// 流式扫描：创建会话，逐条回推
const sessions = new Map<number, Worker>()
let nextSessionId = 1

export function start(event: IpcMainInvokeEvent, payload: ScanPayload) {
  const sessionId = nextSessionId++
  // @ts-expect-error -- 知道要改tsconfig但不想改
  const workerUrl = new URL('../workers/projectScanner.worker.js', import.meta.url)
  const worker = new Worker(workerUrl, { type: 'module', workerData: payload } as any)

  sessions.set(sessionId, worker)

  const send = (channel: 'scanner:item' | 'scanner:done' | 'scanner:error', data?: any) => {
    event.sender.send(channel, { sessionId, ...data })
  }

  const cleanup = () => {
    worker.removeAllListeners()
    sessions.delete(sessionId)
  }

  worker.on('message', (msg: any) => {
    if (msg?.type === 'item') {
      send('scanner:item', { item: msg.item })
    }
    else if (msg?.type === 'done') {
      send('scanner:done')
      cleanup()
    }
    else if (msg?.type === 'error') {
      send('scanner:error', { error: msg.error })
      cleanup()
    }
  })

  worker.once('error', (err) => {
    send('scanner:error', { error: String(err) })
    cleanup()
  })
  worker.once('exit', (code) => {
    if (code !== 0) {
      send('scanner:error', { error: `exit ${code}` })
      cleanup()
    }
  })

  return { sessionId }
}

export function stop(sessionId: number) {
  const worker = sessions.get(sessionId)
  if (worker) {
    try {
      worker.terminate()
    }
    catch {}
    worker.removeAllListeners()
    sessions.delete(sessionId)
    return { stopped: true }
  }
  return { stopped: false }
}

/**
 * 自动检测 VSCode state.vscdb 路径
 * 全平台通用
 */
export function detectVscodeStateDbPath() {
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
