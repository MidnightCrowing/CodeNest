import path from 'node:path'

import { shell } from 'electron'
import fs from 'fs-extra'

import type { DataFileEnum } from '../utils/dataPath'
import { getDataFilePath } from '../utils/dataPath'

// 保存数据到指定的 JSON 文件
export async function saveData(fileType: DataFileEnum, data: string) {
  const filePath = getDataFilePath(fileType)
  try {
    await fs.ensureFile(filePath)
    await fs.writeJSON(filePath, JSON.parse(data), { spaces: 2 })
    return { success: true as const }
  }
  catch (e: any) {
    console.error('Error saving data:', e?.message || e)
    return { success: false as const, error: e?.message || String(e) }
  }
}

// 从指定的 JSON 文件加载数据
export async function loadData(fileType: DataFileEnum) {
  const filePath = getDataFilePath(fileType)
  try {
    const data = await fs.readJSON(filePath)
    return { success: true as const, data: JSON.stringify(data) }
  }
  catch (e: any) {
    console.error('Error loading data:', e?.message || e)
    return { success: false as const, error: e?.message || String(e) }
  }
}

/**
 * 使用系统默认方式打开指定文件
 * @param filePath - 要打开的文件路径
 * @returns 是否成功打开
 */
function openLocalFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    return false
  }
  try {
    shell.openPath(filePath) // 使用系统默认应用打开文件
    return true
  }
  catch (error) {
    console.error(`Failed to open file: ${filePath}`, error)
    return false
  }
}

// 打开指定的 JSON 文件
export async function openData(fileType: DataFileEnum): Promise<boolean> {
  const filePath = getDataFilePath(fileType)
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify({}), 'utf8')
    }
    return openLocalFile(filePath)
  }
  catch (e) {
    console.error(`Failed to open or create json file: ${e}`)
    return false
  }
}

// 删除指定的 JSON 文件
export async function deleteData(fileType: DataFileEnum) {
  const filePath = getDataFilePath(fileType)
  try {
    await fs.remove(filePath)
    return { success: true as const }
  }
  catch (e: any) {
    console.error('Error deleting data file:', e?.message || e)
    return { success: false as const, error: e?.message || String(e) }
  }
}
