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

const USER_REGEX_PATTERN_RE = /^\/(.*)\/([gimsuy]*)$/

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

export async function addNewProjectsFromScanner() {
  const projectsStore = useProjectsStore()
  const settingsStore = useSettingsStore()
  const scannerStore = useProjectScannerStore()
  const editorLangGroupsStore = useEditorLangGroupsStore()

  if (!settingsStore.scannerEnabled)
    return

  await scannerStore.loadProjectScannerData()
  await projectsStore.loadProjects()

  projectsStore.allProjects.forEach(p => scannerStore.addScannedPath(p.path))

  try {
    const { items } = await window.api.scanProjects({
      ...toRaw(settingsStore.scanner),
      existingPaths: Array.from(scannerStore.allHistoryScannedPaths),
    })

    for (const item of items) {
      const path = item.path
      const name = item.name || 'Unnamed Project'

      scannerStore.addScannedPath(path)

      const mainLang = item.mainLang || 'unknown'
      let license: LicenseEnum | undefined
      const res = await window.api.readProjectLicense(path)
      if (res?.success && res.snippet) {
        const { license: detected, score } = detectLicenseBySnippet(res.snippet)
        if (detected && score > 0) {
          license = detected
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
    }

    await Promise.all([
      projectsStore.saveProjects(),
      scannerStore.saveProjectScannerData(),
    ])
  }
  catch (error) {
    console.error('Project scanner failed:', error)
  }
}
