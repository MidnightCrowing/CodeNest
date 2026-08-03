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

export interface ProjectScannerImportResult {
  scanned: number
  added: number
  failed: number
}

function toProjectKind(value: unknown): ProjectKind {
  return Object.values(ProjectKind).includes(value as ProjectKind)
    ? value as ProjectKind
    : ProjectKind.MINE
}

export function toRegExp(pattern: string): RegExp | null {
  try {
    // 限制长度，降低失控正则风险面
    if (!pattern || pattern.length > MAX_REGEX_LENGTH)
      return null

    const match = pattern.match(USER_REGEX_PATTERN_RE)
    const regexSource = match ? match[1] : pattern
    // 去掉 g/y：布尔匹配不需要，且 lastIndex 会让多次 test 结果不一致
    const flags = match ? match[2].replace(/[gy]/g, '') : ''

    return new RegExp(regexSource, flags)
  }
  catch (e: unknown) {
    console.error('Invalid regex:', e)
    return null
  }
}

/** 扫描进行中状态(启动自动扫描与手动同步共享),供 UI 展示。 */
const scannerBusyRef = ref(false)
export const scannerBusy = readonly(scannerBusyRef)

let inFlightScan: Promise<ProjectScannerImportResult> | null = null

/**
 * 扫描并导入新项目。单例执行:扫描进行中时再次调用会
 * 复用同一个进行中的 Promise,不会并发跑两个扫描
 * (并发会因 existingPaths 快照相同而导入重复项目)。
 */
export function addNewProjectsFromScanner(): Promise<ProjectScannerImportResult> {
  if (inFlightScan)
    return inFlightScan

  scannerBusyRef.value = true
  inFlightScan = runScan().finally(() => {
    inFlightScan = null
    scannerBusyRef.value = false
  })
  return inFlightScan
}

async function runScan(): Promise<ProjectScannerImportResult> {
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

    if (cachedScan && cachedScan.signature === item.signature) {
      license = cachedScan.license
      if (cachedScan.mainLang)
        mainLang = cachedScan.mainLang
      if (cachedScan.mainLangColor)
        mainLangColor = cachedScan.mainLangColor
      if (cachedScan.langGroup)
        langGroup = cachedScan.langGroup
    }

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

    const configuredEditor = settingsStore.resolveVisibleEditor(settingsStore.scanner.editor) ?? settingsStore.scanner.editor
    const languageEditor = settingsStore.resolveVisibleEditor(
      editorLangGroupsStore.getEditorByLanguage(mainLang),
      configuredEditor,
    ) ?? configuredEditor
    const hasSourceEditor = isCodeEditor(item.ide)
    const sourceEditor = hasSourceEditor
      ? settingsStore.resolveVisibleEditor(item.ide as CodeEditorEnum, languageEditor) ?? languageEditor
      : null

    let defaultOpen: CodeEditorEnum
    if (hasSourceEditor) {
      if (settingsStore.scanner.ideOpenMode === 'source')
        defaultOpen = sourceEditor ?? languageEditor
      else if (settingsStore.scanner.ideOpenMode === 'specified')
        defaultOpen = configuredEditor
      else
        defaultOpen = languageEditor
    }
    else {
      defaultOpen = settingsStore.scanner.rootOpenMode === 'specified'
        ? configuredEditor
        : languageEditor
    }

    const kind = toProjectKind(item.detectedKind)
    const sourceUrl = kind !== ProjectKind.MINE ? item.fromUrl?.trim() || undefined : undefined
    const sourceName = kind !== ProjectKind.MINE ? item.fromName?.trim() || undefined : undefined

    const newProject: LocalProject = {
      appendTime: Date.now(),
      path,
      name,
      group: '',
      kind,
      fromUrl: sourceUrl,
      fromName: sourceName,
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
