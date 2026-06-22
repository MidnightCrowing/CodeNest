import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { showPop as showLanguagePop } from '~/components/LanguagePop/LanguagePopProvider'
import { showRemoveDialog } from '~/components/RemoveProjectDialog'
import { showToast } from '~/components/ui/toast'
import { SettingPageEnum, ViewEnum } from '~/constants/appEnums'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { isCodeEditor, isVscodeHistoryScannerEditor } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import {
  DEFAULT_EDITOR_ACTION_PREFIX,
  DEFAULT_EDITOR_AUTO_ACTION,
  OPEN_WITH_ACTION_PREFIX,
} from '~/constants/projectActions'
import type { ProjectScannerImportResult } from '~/services/projectScannerService'
import { addNewProjectsFromScanner, scannerBusy } from '~/services/projectScannerService'
import { useEditorLangGroupsStore } from '~/stores/editorLangGroupsStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { formatActionError } from '~/utils/error'
import {
  initializeNewProjectState,
  initializeUpdateProjectState,
} from '~/views/ProjectEditorView'
import { activatedPage } from '~/views/SettingsView'

import {
  MIN_SYNC_BUSY_MS,
  SCAN_RESULT_TOAST_THRESHOLD_MS,
} from '../constants'
import { projectSourceExternalUrl } from '../utils/projectSource'

interface ProjectActionsOpenState {
  clearProjectOpening: (projectId: number) => void
  clearProjectFromMaps: (projectId: number) => void
  clearTerminalOpening: (projectId: number) => void
  finishProjectOpening: (projectId: number) => void
  finishTerminalOpening: (projectId: number) => void
  isProjectOpening: (project: LocalProject) => boolean
  isTerminalOpening: (project: LocalProject) => boolean
  markProjectOpening: (projectId: number) => void
  markTerminalOpening: (projectId: number) => void
}

interface UseProjectActionsOptions {
  deleteProjectRefs: (projectId: number) => void
  navigateFromHome: (view: ViewEnum) => void
  openState: ProjectActionsOpenState
}

export function useProjectActions(options: UseProjectActionsOptions) {
  const projectsStore = useProjectsStore()
  const settingsStore = useSettingsStore()
  const editorLangGroupsStore = useEditorLangGroupsStore()
  const { t } = useI18n()

  const manualSyncing = ref(false)
  const syncing = computed(() => manualSyncing.value || scannerBusy.value)
  const copyFeedback = ref<Record<number, 'success' | 'error'>>({})
  const copyFeedbackTimers = new Map<number, number>()

  const {
    clearProjectFromMaps: clearOpenStateFromMaps,
    clearProjectOpening,
    clearTerminalOpening,
    finishProjectOpening,
    finishTerminalOpening,
    isProjectOpening,
    isTerminalOpening,
    markProjectOpening,
    markTerminalOpening,
  } = options.openState

  function addProject() {
    initializeNewProjectState()
    options.navigateFromHome(ViewEnum.ProjectEditor)
  }

  function editProject(project: LocalProject) {
    initializeUpdateProjectState(project)
    options.navigateFromHome(ViewEnum.ProjectEditor)
  }

  async function openProject(project: LocalProject) {
    if (isProjectOpening(project))
      return

    await openProjectWithEditor(project, project.defaultOpen)
  }

  async function openProjectWithEditor(project: LocalProject, editor: CodeEditorEnum) {
    if (!project.isExists || isProjectOpening(project))
      return

    if (project.isRemote) {
      await openRemoteProjectWithEditor(project, editor)
      return
    }

    const launchConfig = settingsStore.getEditorLaunchConfig(editor)
    if (!launchConfig?.command) {
      showMissingEditorCommandToast()
      return
    }

    markProjectOpening(project.appendTime)
    try {
      await window.api.openProject(launchConfig.command, project.path, launchConfig.openInTerminal)
      void projectsStore.markProjectOpened(project.appendTime)
      finishProjectOpening(project.appendTime)
    }
    catch (error: unknown) {
      clearProjectOpening(project.appendTime)
      console.error('Failed to open project:', error)
      showToast({
        tone: 'error',
        title: t('app.home.feedback.open_failed'),
        description: formatActionError(error),
      })
    }
  }

  async function openRemoteProjectWithEditor(project: LocalProject, editor: CodeEditorEnum) {
    if (!project.remoteHost || !project.remotePath)
      return

    if (!isVscodeHistoryScannerEditor(editor)) {
      showToast({
        tone: 'error',
        title: t('app.home.feedback.open_failed'),
        description: t('app.home.feedback.remote_editor_unsupported'),
      })
      return
    }

    const launchConfig = settingsStore.getEditorLaunchConfig(editor)
    if (!launchConfig?.command) {
      showMissingEditorCommandToast()
      return
    }

    markProjectOpening(project.appendTime)
    try {
      await window.api.openRemoteProject(project.remoteHost, project.remotePath, launchConfig.command, 'vscode')
      void projectsStore.markProjectOpened(project.appendTime)
      finishProjectOpening(project.appendTime)
    }
    catch (error: unknown) {
      clearProjectOpening(project.appendTime)
      console.error('Failed to open remote project:', error)
      showToast({
        tone: 'error',
        title: t('app.home.feedback.open_failed'),
        description: formatActionError(error),
      })
    }
  }

  function clearProjectFromMaps(projectId: number) {
    options.deleteProjectRefs(projectId)
    clearCopyFeedback(projectId)
    clearOpenStateFromMaps(projectId)
  }

  async function copyProjectPath(project: LocalProject) {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error('Clipboard API is not available')

      await navigator.clipboard.writeText(project.path)
      setCopyFeedback(project.appendTime, 'success')
    }
    catch (error) {
      console.error('Failed to copy project path:', error)
      setCopyFeedback(project.appendTime, 'error')
    }
  }

  function setCopyFeedback(projectId: number, status: 'success' | 'error') {
    const activeTimer = copyFeedbackTimers.get(projectId)
    if (activeTimer)
      window.clearTimeout(activeTimer)

    copyFeedback.value = {
      ...copyFeedback.value,
      [projectId]: status,
    }

    const timer = window.setTimeout(() => {
      const { [projectId]: _removed, ...rest } = copyFeedback.value
      copyFeedback.value = rest
      copyFeedbackTimers.delete(projectId)
    }, 1400)

    copyFeedbackTimers.set(projectId, timer)
  }

  function clearCopyFeedback(projectId: number) {
    const copyTimer = copyFeedbackTimers.get(projectId)
    if (copyTimer) {
      window.clearTimeout(copyTimer)
      copyFeedbackTimers.delete(projectId)
    }
  }

  function clearCopyFeedbackTimers() {
    copyFeedbackTimers.forEach(timer => window.clearTimeout(timer))
    copyFeedbackTimers.clear()
  }

  function scanResultDescription(result: ProjectScannerImportResult, changedStatusCount: number) {
    const parts: string[] = []

    if (result.added > 0)
      parts.push(t('app.home.feedback.scan_added', { count: result.added }))
    if (changedStatusCount > 0)
      parts.push(t('app.home.feedback.scan_updated', { count: changedStatusCount }))
    if (result.failed > 0)
      parts.push(t('app.home.feedback.scan_failed_items', { count: result.failed }))

    return parts.length > 0
      ? parts.join(t('app.common.list_separator'))
      : t('app.home.feedback.scan_no_changes')
  }

  function showScanResultToast(result: ProjectScannerImportResult, changedStatusCount: number, elapsed: number) {
    const hasVisibleResult = result.added > 0 || result.failed > 0 || changedStatusCount > 0
    if (!hasVisibleResult && elapsed < SCAN_RESULT_TOAST_THRESHOLD_MS)
      return

    showToast({
      tone: result.failed > 0 ? 'warning' : hasVisibleResult ? 'success' : 'info',
      title: t('app.home.feedback.scan_completed'),
      description: scanResultDescription(result, changedStatusCount),
    })
  }

  function openProjectSource(project: LocalProject) {
    const sourceUrl = projectSourceExternalUrl(project)
    if (sourceUrl)
      window.api.openExternal(sourceUrl)
  }

  async function toggleProjectPinned(project: LocalProject) {
    await projectsStore.toggleProjectPinned(project.appendTime)
  }

  async function toggleProjectArchived(project: LocalProject) {
    await projectsStore.toggleProjectArchived(project.appendTime)
  }

  async function setProjectDefaultEditor(project: LocalProject, editor: CodeEditorEnum) {
    await projectsStore.setProjectDefaultOpen(project.appendTime, editor)
  }

  async function setProjectDefaultEditorAutomatically(project: LocalProject) {
    const editor = editorLangGroupsStore.getEditorByLanguage(project.mainLang, project.defaultOpen) ?? project.defaultOpen
    await setProjectDefaultEditor(project, editor)
  }

  function handleProjectMenuSelect(project: LocalProject, action: string) {
    if (action.startsWith(OPEN_WITH_ACTION_PREFIX)) {
      const editor = action.slice(OPEN_WITH_ACTION_PREFIX.length)
      if (isCodeEditor(editor))
        void openProjectWithEditor(project, editor)
      return
    }

    if (action === DEFAULT_EDITOR_AUTO_ACTION) {
      void setProjectDefaultEditorAutomatically(project)
      return
    }

    if (action.startsWith(DEFAULT_EDITOR_ACTION_PREFIX)) {
      const editor = action.slice(DEFAULT_EDITOR_ACTION_PREFIX.length)
      if (isCodeEditor(editor))
        void setProjectDefaultEditor(project, editor)
      return
    }

    switch (action) {
      case 'pin':
        void toggleProjectPinned(project)
        break
      case 'archive':
        void toggleProjectArchived(project)
        break
      case 'source':
      case 'open-source':
        openProjectSource(project)
        break
      case 'open':
        void openProject(project)
        break
      case 'explorer':
        openInExplorer(project)
        break
      case 'terminal':
        void openInTerminal(project)
        break
      case 'copy':
      case 'copy-path':
        void copyProjectPath(project)
        break
      case 'edit':
        editProject(project)
        break
      case 'remove':
        showRemoveDialog(project)
        break
    }
  }

  function openInExplorer(project: LocalProject) {
    window.api.openInExplorer(project.path)
  }

  async function openInTerminal(project: LocalProject) {
    if (!project.isExists || isTerminalOpening(project))
      return

    markTerminalOpening(project.appendTime)
    try {
      if (project.isRemote && project.remoteHost && project.remotePath) {
        await window.api.openRemoteProject(project.remoteHost, project.remotePath, '', 'terminal')
      }
      else {
        await window.api.openInTerminal(project.path, settingsStore.terminalCommand)
      }
      finishTerminalOpening(project.appendTime)
    }
    catch (error) {
      clearTerminalOpening(project.appendTime)
      console.error('Failed to open project in terminal:', error)
      showToast({
        tone: 'error',
        title: t('app.home.feedback.terminal_failed'),
        description: formatActionError(error),
      })
    }
  }

  async function syncProjects() {
    if (!settingsStore.scannerEnabled || syncing.value)
      return

    const startedAt = performance.now()
    let workElapsed = 0
    let changedStatusCount = 0
    let scanResult: ProjectScannerImportResult | null = null
    let scanError: unknown = null
    manualSyncing.value = true
    try {
      changedStatusCount = await projectsStore.refreshProjectExistence()
      scanResult = await addNewProjectsFromScanner()
    }
    catch (error) {
      console.error('Project scanner failed:', error)
      scanError = error
    }
    finally {
      workElapsed = performance.now() - startedAt
      if (workElapsed < MIN_SYNC_BUSY_MS)
        await new Promise(resolve => setTimeout(resolve, MIN_SYNC_BUSY_MS - workElapsed))
      manualSyncing.value = false
    }

    if (scanError) {
      showToast({
        tone: 'error',
        title: t('app.home.feedback.scan_failed'),
        description: formatActionError(scanError),
      })
      return
    }

    if (scanResult)
      showScanResultToast(scanResult, changedStatusCount, workElapsed)
  }

  function showLanguage(project: LocalProject, event: MouseEvent) {
    showLanguagePop(project, event.currentTarget as HTMLElement)
  }

  function openSettings() {
    options.navigateFromHome(ViewEnum.Settings)
  }

  function openEditorSettings() {
    activatedPage.value = SettingPageEnum.Ides
    options.navigateFromHome(ViewEnum.Settings)
  }

  function showMissingEditorCommandToast() {
    showToast({
      tone: 'warning',
      title: t('no_ide_path_dialog.dialog_title'),
      description: t('no_ide_path_dialog.dialog_desc'),
      action: {
        label: t('no_ide_path_dialog.set'),
        onSelect: openEditorSettings,
      },
    })
  }

  return {
    addProject,
    clearCopyFeedbackTimers,
    clearProjectFromMaps,
    copyFeedback,
    copyProjectPath,
    editProject,
    handleProjectMenuSelect,
    openInExplorer,
    openInTerminal,
    openProject,
    openProjectSource,
    openSettings,
    showLanguage,
    syncing,
    syncProjects,
  }
}
