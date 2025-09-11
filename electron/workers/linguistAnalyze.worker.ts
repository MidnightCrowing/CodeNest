import * as fs from 'node:fs/promises'
import { parentPort, workerData } from 'node:worker_threads'

import type { LinguistResult } from '../utils/linguist'
import { analyzeFolder } from '../utils/linguist'

interface Payload { folderPath: string }

type WorkerMsg
  = | { type: 'progress', stage: 'start' | 'checking' | 'analyzing' | 'done' }
    | { type: 'result', result: LinguistResult }
    | { type: 'error', error: string }

async function run() {
  const { folderPath } = workerData as Payload

  try {
    parentPort?.postMessage({ type: 'progress', stage: 'start' } satisfies WorkerMsg)

    // 轻量校验，避免主线程重复 IO
    parentPort?.postMessage({ type: 'progress', stage: 'checking' } satisfies WorkerMsg)
    const stat = await fs.stat(folderPath)
    if (!stat.isDirectory())
      throw new Error('Provided path is not a directory')

    parentPort?.postMessage({ type: 'progress', stage: 'analyzing' } satisfies WorkerMsg)
    const result = await analyzeFolder(folderPath)

    parentPort?.postMessage({ type: 'result', result } satisfies WorkerMsg)
    parentPort?.postMessage({ type: 'progress', stage: 'done' } satisfies WorkerMsg)
  }
  catch (e: any) {
    parentPort?.postMessage({ type: 'error', error: e?.message || String(e) } satisfies WorkerMsg)
  }
}

run()
