import { unref } from 'vue'

import { clearState, setState } from '~/components/StateBar'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { languageToEditorMap } from '~/constants/codeEditor'
import type { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { detectLicenseBySnippet } from '~/services/licenseDetector'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { t } from '~/utils/i18n'

function toRegExp(pattern: string): RegExp | null {
  try {
    const match = pattern.match(/^\/(.*)\/([gimsuy]*)$/)
    if (match)
      return new RegExp(match[1], match[2])
    return new RegExp(pattern)
  }
  catch (e) {
    console.error('Invalid regex:', e)
    return null
  }
}

/**
 * 在主进程 Worker 中扫描并分析新增项目目录（流式），边扫边加入项目列表
 */
export async function addNewProjectsInWorker() {
  const projects = useProjectsStore()
  const settings = useSettingsStore()
  const scanner = useProjectScannerStore()

  await scanner.loadProjectScannerData()
  await projects.loadProjects()

  projects.allProjects.forEach(p => scanner.addScannedPath(p.path))

  const roots = Array.isArray(unref(settings.projectScannerRoots))
    ? [...unref(settings.projectScannerRoots) as string[]]
    : []
  const existingPaths = Array.from(unref(scanner.allHistoryScannedPaths))

  // 初始状态：扫描中
  setState('projectScanner', t('status.project_scanner.scanning'), true)

  // 启动扫描（异步）
  const { sessionId } = await window.api.startProjectScan({
    roots,
    existingPaths,
  })

  // 先声明，再在 finalize 中使用，避免 no-use-before-define
  let offItem: (() => void) | null = null
  let offDone: (() => void) | null = null
  let offError: (() => void) | null = null
  let finalized = false
  let foundCount = 0

  const finalize = async () => {
    if (finalized)
      return
    finalized = true
    offItem?.()
    offDone?.()
    offError?.()
    offItem = offDone = offError = null
    await Promise.all([
      projects.saveProjects(),
      scanner.saveProjectScannerData(),
    ])
    clearState('projectScanner')
  }

  // 订阅事件（逐条写入）
  offItem = window.api.onScannerItem(async ({ sessionId: sid, item }) => {
    if (sid !== sessionId)
      return

    const path = item.path as string
    const name = (item.name as string) || 'Unnamed Project'

    // 记录扫描历史
    scanner.addScannedPath(path)

    const mainLang = (item.mainLang || 'unknown') as string

    let license: LicenseEnum | undefined
    const res = await window.api.readProjectLicense(path)
    if (res?.success && res.snippet) {
      const { license: detected, score } = detectLicenseBySnippet(res.snippet)
      if (detected && score > 0) {
        license = detected
      }
    }

    const defaultOpen: CodeEditorEnum = settings.projectScannerOpenMode === 'specified'
      ? settings.projectScannerEditor
      : languageToEditorMap[mainLang.toLowerCase()] || settings.projectScannerEditor

    const isTemporary: boolean = toRegExp(settings.projectScannerNamePattern)?.test(name) || false

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
      isTemporary,
      isExists: true,
    }

    await projects.addProject(newProject, false)

    // 更新“已发现 N 个新项目”
    foundCount += 1
    setState(
      'projectScanner',
      foundCount === 1
        ? t('status.project_scanner.found_one')
        : t('status.project_scanner.found_many', { count: foundCount }),
      true,
    )
  })

  offDone = window.api.onScannerDone(async ({ sessionId: sid }) => {
    if (sid !== sessionId)
      return
    // 完成
    setState('projectScanner', t('status.project_scanner.done'), false)
    await finalize()
  })

  offError = window.api.onScannerError(async ({ sessionId: sid }) => {
    if (sid !== sessionId)
      return
    // 失败
    setState('projectScanner', t('status.project_scanner.error'), false)
    await finalize()
  })
}
