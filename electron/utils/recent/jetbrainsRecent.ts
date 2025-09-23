import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { XMLParser } from 'fast-xml-parser'

import { uniqExistingDirs } from './shared'

export interface JetbrainsRecentEntry {
  path: string
  ide: string | null // 例如 "PyCharm", "IntelliJIdea"
}

const ideNameMap: Record<string, string> = {
  'IntelliJIdea': 'intellij-idea',
  'PyCharm': 'pycharm',
  'PhpStorm': 'phpstorm',
  'GoLand': 'goLand',
  'Rider': 'rider',
  'CLion': 'clion',
  'RustRover': 'rust-rover',
  'WebStorm': 'webstorm',
  'RubyMine': 'rubymine',
  'Aqua': 'aqua',
  'Fleet': 'fleet',
  'AndroidStudio': 'android-studio',
} as const

/**
 * 获取 JetBrains 所有 IDE 的最近项目列表
 * @param configRoot JetBrains 配置根目录（例如 C:\Users\xxx\AppData\Roaming\JetBrains）
 */
function getAllJetbrainsRecentProjects(
  configRoot: string,
): JetbrainsRecentEntry[] {
  if (!fs.existsSync(configRoot)) {
    throw new Error(`JetBrains config root not found: ${configRoot}`)
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  })

  const userHome = os.homedir()
  const normalizePath = (p: string): string =>
    p.replace(/\$USER_HOME\$/g, userHome).replace(/\\/g, '/')

  const entries: JetbrainsRecentEntry[] = []

  // 遍历 JetBrains 目录下的所有子目录
  for (const subdir of fs.readdirSync(configRoot)) {
    const fullDir = path.join(configRoot, subdir)
    if (!fs.statSync(fullDir).isDirectory())
      continue

    const xmlPath = path.join(fullDir, 'options', 'recentProjects.xml')
    if (!fs.existsSync(xmlPath))
      continue

    const xmlContent = fs.readFileSync(xmlPath, 'utf-8')
    const json = parser.parse(xmlContent)

    const ideNameRaw = subdir.replace(/\d.*$/, '') // 去掉版本号，比如 "PyCharm2025.1" -> "PyCharm"
    const ideName = ideNameMap[ideNameRaw] ?? null

    const options = json?.application?.component?.option
    if (!options)
      continue

    // 可能是数组，也可能是单个对象
    const optionList = Array.isArray(options) ? options : [options]

    const additionalInfo = optionList.find(opt => opt.name === 'additionalInfo')
    if (!additionalInfo?.map?.entry)
      continue

    const projectEntries = additionalInfo.map.entry

    if (Array.isArray(projectEntries)) {
      for (const e of projectEntries) {
        if (e.key)
          entries.push({ path: normalizePath(e.key), ide: ideName })
      }
    }
    else if (projectEntries?.key) {
      entries.push({ path: normalizePath(projectEntries.key), ide: ideName })
    }
  }

  // 去重：按 path 唯一
  const seen = new Set<string>()
  const uniqueEntries: JetbrainsRecentEntry[] = []
  for (const e of entries) {
    if (!seen.has(e.path)) {
      seen.add(e.path)
      uniqueEntries.push(e)
    }
  }

  return uniqueEntries
}

export function collectFromJetbrains(configRoot: string | null): JetbrainsRecentEntry[] {
  if (!configRoot) {
    return []
  }
  let entries: JetbrainsRecentEntry[] = []
  try {
    entries = getAllJetbrainsRecentProjects(configRoot)
  }
  catch {
    return []
  }
  const candidates: JetbrainsRecentEntry[] = []
  for (const e of entries) {
    const p = e.path
    // Skip placeholders and JetBrains light-edit/scratches etc.
    if (!p || /\$[A-Z_]+\$/.test(p) || /light-edit|scratches/i.test(p))
      continue
    const norm = process.platform === 'win32' ? p.replace(/\//g, '\\') : p
    candidates.push({ path: norm, ide: e.ide })
  }
  return uniqExistingDirs(candidates)
}
