import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Worker } from 'node:worker_threads'

import type { IpcMainInvokeEvent } from 'electron'
import { app } from 'electron'

export interface ScanPayload {
  // file system roots scanning
  rootsEnabled: boolean
  roots: string[]

  // IDE scanning toggles
  ideEnabled: boolean
  jetbrains: {
    enabled: boolean
    configRootPath: string
  }
  vscode: {
    enabled: boolean
    stateDbPath: string
  }
  visualStudio: {
    enabled: boolean
  }

  existingPaths: string[]
}

// 流式扫描：创建会话，逐条回推
const sessions = new Map<number, Worker>()
let nextSessionId = 1

export function start(event: IpcMainInvokeEvent, payload: ScanPayload) {
  const sessionId = nextSessionId++
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
 * 自动检测 JetBrains 配置根目录
 * 返回例如：
 *  - Windows: C:\\Users\\<user>\\AppData\\Roaming\\JetBrains
 *  - macOS:   ~/Library/Application Support/JetBrains
 *  - Linux:   ~/.config/JetBrains 或 ~/.JetBrains（优先 .config/JetBrains）
 */
export function detectJetBrainsConfigRootPath() {
  const candidates: string[] = []

  switch (process.platform) {
    case 'win32': {
      // Roaming AppData
      candidates.push(path.join(app.getPath('appData'), 'JetBrains'))
      break
    }
    case 'darwin': {
      candidates.push(path.join(app.getPath('home'), 'Library', 'Application Support', 'JetBrains'))
      break
    }
    default: {
      // linux
      const home = app.getPath('home')
      candidates.push(path.join(home, '.config', 'JetBrains'))
      candidates.push(path.join(home, '.JetBrains')) // 一些老版本
      break
    }
  }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory())
        return p
    }
    catch {
      // ignore
    }
  }

  return null
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
