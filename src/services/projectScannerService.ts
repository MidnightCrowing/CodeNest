import type { CodeEditorEnum } from '~/constants/codeEditor'
import { isCodeEditor } from '~/constants/codeEditor'
import type { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { detectLicenseBySnippet } from '~/services/licenseDetector'
import { useEditorLangGroupsStore } from '~/stores/editorLangGroupsStore'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { t } from '~/utils/i18n'

const USER_REGEX_PATTERN_RE = /^\/(.*)\/([gimsuy]*)$/
const MAX_REGEX_LENGTH = 200
const MAX_REGEX_NESTING = 3

export interface ProjectScannerImportResult {
  scanned: number
  added: number
  failed: number
}

export function checkRegexComplexity(pattern: string): boolean {
  // 检测嵌套量词(ReDoS 主要来源):如 (a+)+, (a*)*
  let nesting = 0
  let maxNesting = 0
  let lastWasQuantifier = false

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]

    // 跳过转义字符
    if (char === '\\') {
      i++
      lastWasQuantifier = false
      continue
    }

    // 检测量词
    const isQuantifier = /[*+?{]/.test(char)

    if (char === '(') {
      nesting++
      maxNesting = Math.max(maxNesting, nesting)
      lastWasQuantifier = false
    }
    else if (char === ')') {
      if (nesting === 0) {
        // 不匹配的右括号
        return false
      }
      nesting--
      // 括号后跟量词,检查是否为嵌套量词
      if (i + 1 < pattern.length && /[*+?{]/.test(pattern[i + 1])) {
        if (lastWasQuantifier) {
          // 检测到嵌套量词
          return false
        }
        lastWasQuantifier = true
      }
      else {
        lastWasQuantifier = false
      }
    }
    else if (isQuantifier) {
      if (lastWasQuantifier) {
        // 连续量词
        return false
      }
      lastWasQuantifier = true
    }
    else {
      lastWasQuantifier = false
    }
  }

  // 检查括号是否匹配
  if (nesting !== 0) {
    return false
  }

  // 检查嵌套层级
  if (maxNesting > MAX_REGEX_NESTING) {
    return false
  }

  return true
}

export function toRegExp(pattern: string): RegExp | null {
  try {
    // 限制长度,降低恶意/失控正则的风险面
    if (!pattern || pattern.length > MAX_REGEX_LENGTH)
      return null

    const match = pattern.match(USER_REGEX_PATTERN_RE)
    const regexSource = match ? match[1] : pattern
    // 去掉 g/y 标志:布尔匹配用不到,且会因 lastIndex 状态
    // 导致同一实例多次 test() 结果不一致
    const flags = match ? match[2].replace(/[gy]/g, '') : ''

    // 检查正则复杂度,防止 ReDoS
    if (!checkRegexComplexity(regexSource)) {
      console.warn('Regex pattern is too complex (potential ReDoS):', pattern)
      return null
    }

    return new RegExp(regexSource, flags)
  }
  catch (e: unknown) {
    console.error('Invalid regex:', e)
    return null
  }
}

export async function addNewProjectsFromScanner(): Promise<ProjectScannerImportResult> {
  const projectsStore = useProjectsStore()
  const settingsStore = useSettingsStore()
  const scannerStore = useProjectScannerStore()
  const editorLangGroupsStore = useEditorLangGroupsStore()

  if (!settingsStore.scannerEnabled)
    return { scanned: 0, added: 0, failed: 0 }

  await scannerStore.loadProjectScannerData()
  if (!projectsStore.loaded)
    await projectsStore.loadProjects()

  projectsStore.allProjects.forEach(p => scannerStore.addScannedPath(p.path))

  const { items } = await window.api.scanProjects({
    ...toRaw(settingsStore.scanner),
    existingPaths: Array.from(scannerStore.allHistoryScannedPaths),
    cacheEntries: scannerStore.scanCacheEntries,
  })

  let added = 0
  const failed = items.filter(item => !!item.error).length
  const namePatternRegex = toRegExp(settingsStore.scanner.namePattern)
  let licenseErrorCount = 0
  const licenseErrors: string[] = [] // 仅保留前 10 个样本用于日志

  for (const item of items) {
    const path = item.path
    const name = !item.name || item.name === 'Unnamed Project'
      ? t('app.project_editor.unnamed')
      : item.name

    scannerStore.addScannedPath(path)

    const cachedScan = item.signature
      ? scannerStore.getScanCacheEntry(path)
      : null

    let mainLang = item.mainLang || 'unknown'
    let mainLangColor = item.mainLangColor
    let langGroup = item.langGroup || []
    let license: LicenseEnum | undefined

    // Use cache if signature matches
    if (cachedScan && cachedScan.signature === item.signature) {
      license = cachedScan.license
      if (cachedScan.mainLang)
        mainLang = cachedScan.mainLang
      if (cachedScan.mainLangColor)
        mainLangColor = cachedScan.mainLangColor
      if (cachedScan.langGroup)
        langGroup = cachedScan.langGroup
    }

    // Fetch license if not cached
    if (!license) {
      try {
        const res = await window.api.readProjectLicense(path)
        if (res?.success && res.snippet) {
          const { license: detected, score } = detectLicenseBySnippet(res.snippet)
          if (detected && score > 0) {
            license = detected
          }
        }
      }
      catch (error: unknown) {
        licenseErrorCount += 1
        if (licenseErrors.length < 10)
          licenseErrors.push(path)
        console.error(`Failed to read project license '${path}':`, error)
      }
    }

    const sourceEditor = isCodeEditor(item.ide) ? item.ide : null
    const languageEditor = editorLangGroupsStore.getEditorByLanguage(mainLang, settingsStore.scanner.editor) ?? settingsStore.scanner.editor

    let defaultOpen: CodeEditorEnum
    if (sourceEditor) {
      if (settingsStore.scanner.ideOpenMode === 'source')
        defaultOpen = sourceEditor
      else if (settingsStore.scanner.ideOpenMode === 'specified')
        defaultOpen = settingsStore.scanner.editor
      else
        defaultOpen = languageEditor
    }
    else {
      defaultOpen = settingsStore.scanner.rootOpenMode === 'specified'
        ? settingsStore.scanner.editor
        : languageEditor
    }

    const newProject: LocalProject = {
      appendTime: Date.now(),
      path,
      name,
      group: '',
      kind: ProjectKind.MINE,
      mainLang,
      mainLangColor,
      langGroup,
      license,
      defaultOpen,
      isTemporary: (() => {
        try {
          return namePatternRegex?.test(name) || false
        }
        catch {
          return false
        }
      })(),
      isExists: true,
    }

    await projectsStore.addProject(newProject, false)
    added += 1
    if (item.signature) {
      scannerStore.setScanCacheEntry({
        path,
        signature: item.signature,
        name,
        mainLang: item.mainLang,
        mainLangColor: item.mainLangColor,
        langGroup: item.langGroup,
        ide: item.ide,
        error: item.error,
        license,
      })
    }
  }

  await Promise.all([
    projectsStore.saveProjects(),
    scannerStore.saveProjectScannerData(),
  ])

  // 如果有许可证读取错误,记录到控制台
  if (licenseErrorCount > 0) {
    console.warn(
      `Failed to read licenses for ${licenseErrorCount} projects.`,
      `Samples: ${licenseErrors.join(', ')}`,
    )
  }

  return {
    scanned: items.length,
    added,
    failed,
  }
}
