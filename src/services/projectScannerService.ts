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

export interface ProjectScannerImportResult {
  scanned: number
  added: number
  failed: number
}

function toRegExp(pattern: string): RegExp | null {
  try {
    const match = pattern.match(USER_REGEX_PATTERN_RE)
    if (match)
      return new RegExp(match[1], match[2])
    return new RegExp(pattern)
  }
  catch (e) {
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

  for (const item of items) {
    const path = item.path
    const name = !item.name || item.name === 'Unnamed Project'
      ? t('app.project_editor.unnamed')
      : item.name

    scannerStore.addScannedPath(path)

    const mainLang = item.mainLang || 'unknown'
    let license: LicenseEnum | undefined
    const cachedScan = item.signature
      ? scannerStore.getScanCacheEntry(path)
      : null
    if (cachedScan && cachedScan.signature === item.signature) {
      license = cachedScan.license
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
      catch (error) {
        console.error(`Failed to read project license '${path}':`, error)
      }
    }

    const defaultOpen: CodeEditorEnum = isCodeEditor(item.ide)
      ? item.ide
      : settingsStore.scanner.openMode === 'specified'
        ? settingsStore.scanner.editor
        : editorLangGroupsStore.getEditorByLanguage(mainLang, settingsStore.scanner.editor) ?? settingsStore.scanner.editor

    const newProject: LocalProject = {
      appendTime: Date.now(),
      path,
      name,
      group: '',
      kind: ProjectKind.MINE,
      mainLang,
      mainLangColor: item.mainLangColor,
      langGroup: item.langGroup || [],
      license,
      defaultOpen,
      isTemporary: toRegExp(settingsStore.scanner.namePattern)?.test(name) || false,
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

  return {
    scanned: items.length,
    added,
    failed,
  }
}
