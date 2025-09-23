import { exec } from 'node:child_process'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

import type { IpcMainInvokeEvent } from 'electron'
import { dialog } from 'electron'
import fs from 'fs-extra'
import trash from 'trash'

import { projectsFilePath } from '../utils/dataPath'
import type { LinguistResult } from '../utils/linguist'

// 传入项目根目录，获取项目各编程语言的占比
export async function analyzeProject(event: IpcMainInvokeEvent, folderPath: string): Promise<LinguistResult | { error: string }> {
  return await new Promise((resolve) => {
    try {
      const workerUrl = new URL('../workers/linguistAnalyze.worker.js', import.meta.url)
      const worker = new Worker(workerUrl, { type: 'module', workerData: { folderPath } } as any)

      const cleanup = () => worker.removeAllListeners()
      const send = (stage: 'start' | 'checking' | 'analyzing' | 'done') => {
        try {
          event.sender.send('project:analyze:progress', {
            folderPath,
            stage,
          })
        }
        catch {}
      }

      worker.on('message', (msg: any) => {
        if (msg?.type === 'progress') {
          send(msg.stage)
        }
        else if (msg?.type === 'result') {
          cleanup()
          resolve(msg.result as LinguistResult)
        }
        else if (msg?.type === 'error') {
          cleanup()
          resolve({ error: msg.error || 'analyze error' })
        }
      })

      worker.once('error', (err) => {
        cleanup()
        resolve({ error: String(err) })
      })
      worker.once('exit', (code) => {
        if (code !== 0) {
          cleanup()
          resolve({ error: `analyze worker exited with code ${code}` })
        }
      })
    }
    catch (e) {
      resolve({ error: `Error starting analyze worker: ${String(e)}` })
    }
  })
}

// 读取项目许可证的前若干行
export async function readLicense(folderPath: string, maxLines = 20) {
  try {
    if (!folderPath || typeof folderPath !== 'string')
      return { success: false, message: 'Invalid project path' }

    const stat = await fs.stat(folderPath).catch(() => null)
    if (!stat || !stat.isDirectory())
      return { success: false, message: 'Project path does not exist or is not a directory' }

    const entries = await fs.readdir(folderPath)
    const candidates = entries.filter((name) => {
      const lower = name.toLowerCase()
      return (
        // 常见文件名：license/licence/copying/unlicense，允许有扩展名
        lower.startsWith('license')
        || lower.startsWith('licence')
        || lower.startsWith('copying')
        || lower.startsWith('unlicense')
      )
    })

    if (!candidates.length)
      return { success: false, message: 'License file not found' }

    const rank = (filename: string) => {
      const f = filename.toLowerCase()
      const ext = path.extname(f)
      const base = f.replace(ext, '')
      // 优先级：license > licence > copying > unlicense；无扩展名 > .md > .txt > 其他
      const baseScore = base.startsWith('license')
        ? 0
        : base.startsWith('licence')
          ? 1
          : base.startsWith('copying')
            ? 2
            : base.startsWith('unlicense')
              ? 3
              : 9
      const extScore = ext === '' ? 0 : ext === '.md' ? 1 : ext === '.txt' ? 2 : 3
      return baseScore * 10 + extScore
    }

    const picked = candidates.sort((a, b) => rank(a) - rank(b))[0]
    const full = path.join(folderPath, picked)
    const fileStat = await fs.stat(full)
    if (!fileStat.isFile())
      return { success: false, message: 'License file is not a regular file' }

    const content = await fs.readFile(full, 'utf8')
    const lines = content.split(/\r?\n/).slice(0, Math.max(1, Math.min(100, maxLines)))

    return {
      success: true,
      filename: picked,
      snippet: lines.join('\n'),
      lines: lines.length,
    }
  }
  catch (e: any) {
    return { success: false, message: String(e?.message || e) }
  }
}

// 使用IDE打开项目
export async function openInIDE(idePath: string, projectPath: string): Promise<string> {
  if (!idePath || !projectPath) {
    throw new Error('IDE 路径和项目路径不能为空')
  }

  // 验证路径是否正确
  if (!path.isAbsolute(idePath) || !path.isAbsolute(projectPath)) {
    throw new Error('提供的路径必须是绝对路径')
  }

  try {
    // 使用 IDE 打开项目目录
    exec(`"${idePath}" "${projectPath}"`, (error) => {
      if (error) {
        console.error('Failed to open project:', error)
        throw new Error('打开项目失败，请检查 IDE 路径和项目路径是否正确')
      }
    })

    return '项目已成功打开'
  }
  catch (err) {
    console.error(err)
    throw new Error('打开项目时发生错误')
  }
}

// 删除项目
export async function deleteProject(projectPath: string) {
  try {
    if (!fs.existsSync(projectPath)) {
      throw new Error('项目路径不存在')
    }

    // 尝试将文件移动到回收站
    await trash([projectPath])

    return { success: true, message: '项目已移至回收站' }
  }
  catch (error) {
    console.error('删除项目失败:', error)

    // 如果无法移至回收站，则尝试直接删除
    try {
      const stats = fs.lstatSync(projectPath)

      if (stats.isDirectory()) {
        fs.rmSync(projectPath, { recursive: true, force: true })
      }
      else {
        fs.unlinkSync(projectPath)
      }

      return { success: true, message: '项目已直接删除' }
    }
    catch (deleteError: any) {
      console.error('直接删除失败:', deleteError)
      return { success: false, message: '删除项目失败', error: (deleteError as Error).message }
    }
  }
}

// 导入数据
export async function importProjects() {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePaths.length) {
      return { success: false, message: 'No file selected for import' }
    }

    const importedFilePath = result.filePaths[0]

    // 将选中的文件复制到默认数据路径
    await fs.copy(importedFilePath, projectsFilePath)

    return { success: true, message: 'Data file imported successfully' }
  }
  catch (error) {
    console.error('Error importing data file:', error)
    return { success: false, message: 'Failed to import data file' }
  }
}

// 导出数据
export async function exportProjects() {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: 'projects.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePath) {
      return { success: false, message: 'No file path selected for export' }
    }

    const exportedFilePath = result.filePath

    // 复制程序内部的 `data.json` 文件到用户选择的路径
    await fs.copy(projectsFilePath, exportedFilePath)

    return { success: true, message: 'Data file exported successfully' }
  }
  catch (error) {
    console.error('Error exporting data file:', error)
    return { success: false, message: 'Failed to export data file' }
  }
}
