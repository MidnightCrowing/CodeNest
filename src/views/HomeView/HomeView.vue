<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import mainLangPop from '~/components/LanguagePop/LanguagePop.vue'
import { showPop as showLanguagePop } from '~/components/LanguagePop/LanguagePopProvider'
import { setRemoveAnimationCallback, showRemoveDialog } from '~/components/RemoveProjectDialog'
import { showToast } from '~/components/ui/toast'
import UiActionMenu from '~/components/ui/UiActionMenu.vue'
import UiScrollArea from '~/components/ui/UiScrollArea.vue'
import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import { SettingPageEnum, ThemeEnum, ViewEnum } from '~/constants/appEnums'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors, isCodeEditor, isVscodeHistoryScannerEditor } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
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

import { useDisplayPathCache } from './composables/useDisplayPathCache'
import { useProjectFilters } from './composables/useProjectFilters'
import { useProjectMenus } from './composables/useProjectMenus'
import { useProjectNavigation } from './composables/useProjectNavigation'
import { useProjectOpenState } from './composables/useProjectOpenState'
import { useProjectSearch } from './composables/useProjectSearch'
import { useVirtualScroll } from './composables/useVirtualScroll'
import {
  DEFAULT_EDITOR_ACTION_PREFIX,
  DEFAULT_EDITOR_AUTO_ACTION,
  GITHUB_SOURCE_RE,
  HOME_LAYOUT_STORAGE_KEY,
  MIN_SYNC_BUSY_MS,
  OPEN_WITH_ACTION_PREFIX,
  PROJECT_ACTION_KEYS,
  SCAN_RESULT_TOAST_THRESHOLD_MS,
} from './constants'
import LanguageFilterSelect from './LanguageFilterSelect.vue'
import type { LayoutMode, ProjectActionKey, ScrollAreaRef } from './types'

defineOptions({
  name: 'Home',
})

const projectsStore = useProjectsStore()
const settingsStore = useSettingsStore()
const editorLangGroupsStore = useEditorLangGroupsStore()

// Composables
const pathCache = useDisplayPathCache()
const projectSearch = useProjectSearch(computed(() => projectsStore.allProjects))
const activatedView = inject('activatedView') as Ref<ViewEnum>
const { locale, t } = useI18n()

const { searchValue, clearSearch } = projectSearch
const projectFilters = useProjectFilters(projectSearch, t)
const {
  kindFilter,
  statusFilter,
  languageFilter,
  sortKey,
  filteredProjects,
  activeFilterCount,
  totalProjects,
  kindOptions,
  statusOptions,
  languageOptions,
  sortOptions,
  clearFilters,
} = projectFilters

const openState = useProjectOpenState()
const {
  markProjectOpening,
  finishProjectOpening,
  clearProjectOpening,
  isProjectOpening,
  markTerminalOpening,
  finishTerminalOpening,
  clearTerminalOpening,
  isTerminalOpening,
  clearProjectFromMaps: clearOpenStateFromMaps,
} = openState

const layoutMode = ref<LayoutMode>(readStoredLayoutMode())

const virtualScroll = useVirtualScroll(filteredProjects, layoutMode)
const {
  renderedProjects,
  hasMoreProjects,
  resetRenderedProjects,
  setLoadMoreSentinelRef,
  ensureProjectRendered,
} = virtualScroll

function editorHasLaunchCommand(editor: CodeEditorEnum) {
  return !!settingsStore.getEditorLaunchConfig(editor).command.trim()
}

const projectMenus = useProjectMenus({ t, editorHasLaunchCommand })
const {
  projectMenuItems,
  isSourceProject,
  projectSourceUrl,
} = projectMenus

// 手动同步的本地状态(带最短可见时长防闪烁);与服务层共享的
// scannerBusy 合成,让启动自动扫描也能点亮同步按钮的进行中状态。
const manualSyncing = ref(false)
const syncing = computed(() => manualSyncing.value || scannerBusy.value)
const copyFeedback = ref<Record<number, 'success' | 'error'>>({})
const copyFeedbackTimers = new Map<number, number>()
const projectItemRefs = new Map<number, HTMLElement>()
const projectActionRefs = new Map<number, HTMLElement>()
const listScrollAreaRef = ref<ScrollAreaRef | null>(null)
const cardsScrollAreaRef = ref<ScrollAreaRef | null>(null)

const projectNavigation = useProjectNavigation(
  activatedView,
  layoutMode,
  listScrollAreaRef,
  cardsScrollAreaRef,
)
const {
  navigateFromHome,
  restoreHomeScrollPosition,
} = projectNavigation

function readStoredLayoutMode(): LayoutMode {
  try {
    const value = window.localStorage.getItem(HOME_LAYOUT_STORAGE_KEY)
    return value === 'grid' || value === 'list' ? value : 'list'
  }
  catch {
    return 'list'
  }
}

function persistLayoutMode(value: LayoutMode) {
  try {
    window.localStorage.setItem(HOME_LAYOUT_STORAGE_KEY, value)
  }
  catch {
    // Ignore storage errors. The layout toggle still works for the current session.
  }
}

const layoutOptions = computed<Array<{ value: LayoutMode, label: string, icon: string }>>(() => [
  { value: 'list', label: t('app.home.layout.list'), icon: 'i-lucide:list' },
  { value: 'grid', label: t('app.home.layout.grid'), icon: 'i-lucide:layout-grid' },
])

function addProject() {
  initializeNewProjectState()
  navigateFromHome(ViewEnum.ProjectEditor)
}

function editProject(project: LocalProject) {
  initializeUpdateProjectState(project)
  navigateFromHome(ViewEnum.ProjectEditor)
}

async function openProject(project: LocalProject) {
  if (isProjectOpening(project))
    return

  await openProjectWithEditor(project, project.defaultOpen)
}

async function openProjectWithEditor(project: LocalProject, editor: CodeEditorEnum) {
  if (!project.isExists || isProjectOpening(project)) {
    return
  }

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

  // 远程仅支持 VS Code 系（Remote-SSH）
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
  projectItemRefs.delete(projectId)
  projectActionRefs.delete(projectId)

  const copyTimer = copyFeedbackTimers.get(projectId)
  if (copyTimer) {
    window.clearTimeout(copyTimer)
    copyFeedbackTimers.delete(projectId)
  }

  // 委托给 composable 清理打开状态
  clearOpenStateFromMaps(projectId)
}

function setProjectItemRef(projectId: number, element: unknown) {
  if (element instanceof HTMLElement) {
    projectItemRefs.set(projectId, element)
    return
  }

  projectItemRefs.delete(projectId)
}

function setProjectActionsRef(projectId: number, element: unknown) {
  if (element instanceof HTMLElement) {
    projectActionRefs.set(projectId, element)
    return
  }

  projectActionRefs.delete(projectId)
}

async function focusProject(project: LocalProject | undefined) {
  if (!project?.isExists)
    return

  await ensureProjectRendered(project)

  const element = projectItemRefs.get(project.appendTime)
  if (!element)
    return

  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function findProjectByLinearOffset(project: LocalProject, offset: number, includeMissing = false) {
  const projects = filteredProjects.value.filter(item => includeMissing || item.isExists)
  const currentIndex = projects.findIndex(item => item.appendTime === project.appendTime)
  if (currentIndex < 0)
    return undefined

  const targetIndex = Math.max(0, Math.min(projects.length - 1, currentIndex + offset))
  return projects[targetIndex]
}

function focusProjectByLinearOffset(project: LocalProject, offset: number) {
  focusProject(findProjectByLinearOffset(project, offset))
}

function focusProjectAtEdge(edge: 'start' | 'end') {
  const focusableProjects = filteredProjects.value.filter(item => item.isExists)
  focusProject(edge === 'start' ? focusableProjects[0] : focusableProjects.at(-1))
}

function openProjectContextMenuFromKeyboard(event: KeyboardEvent) {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement))
    return

  const rect = target.getBoundingClientRect()
  target.dispatchEvent(new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + Math.min(36, rect.width / 2),
    clientY: rect.top + Math.min(24, rect.height / 2),
  }))
}

function findProjectByGridDirection(project: LocalProject, direction: 'left' | 'right' | 'up' | 'down', includeMissing = false) {
  const currentElement = projectItemRefs.get(project.appendTime)
  if (!currentElement)
    return findProjectByGridLinearDirection(project, direction, includeMissing)

  const currentRect = currentElement.getBoundingClientRect()
  const currentCenterX = currentRect.left + currentRect.width / 2
  const sameRowTolerance = Math.max(8, currentRect.height / 2)

  const candidates = filteredProjects.value
    .filter(item => (includeMissing || item.isExists) && item.appendTime !== project.appendTime)
    .map((item) => {
      const element = projectItemRefs.get(item.appendTime)
      return element
        ? { project: item, rect: element.getBoundingClientRect() }
        : null
    })
    .filter(item => item !== null)

  if (direction === 'left' || direction === 'right') {
    const sameRow = candidates
      .filter(item => Math.abs(item.rect.top - currentRect.top) <= sameRowTolerance)
      .filter(item => direction === 'left' ? item.rect.left < currentRect.left : item.rect.left > currentRect.left)
      .sort((a, b) => direction === 'left' ? b.rect.left - a.rect.left : a.rect.left - b.rect.left)

    if (sameRow[0]) {
      return sameRow[0].project
    }

    return findProjectByLinearOffset(project, direction === 'left' ? -1 : 1, includeMissing)
  }

  const verticalCandidates = candidates
    .filter(item => direction === 'up' ? item.rect.top < currentRect.top - 4 : item.rect.top > currentRect.top + 4)
    .sort((a, b) => {
      const rowDistanceA = Math.abs(a.rect.top - currentRect.top)
      const rowDistanceB = Math.abs(b.rect.top - currentRect.top)
      if (rowDistanceA !== rowDistanceB)
        return rowDistanceA - rowDistanceB

      const centerA = a.rect.left + a.rect.width / 2
      const centerB = b.rect.left + b.rect.width / 2
      return Math.abs(centerA - currentCenterX) - Math.abs(centerB - currentCenterX)
    })

  return verticalCandidates[0]?.project || findProjectByGridLinearDirection(project, direction, includeMissing)
}

function focusCardByDirection(project: LocalProject, direction: 'left' | 'right' | 'up' | 'down') {
  focusProject(findProjectByGridDirection(project, direction))
}

function findProjectByGridLinearDirection(project: LocalProject, direction: 'left' | 'right' | 'up' | 'down', includeMissing = false) {
  const projects = filteredProjects.value.filter(item => includeMissing || item.isExists)
  const currentIndex = projects.findIndex(item => item.appendTime === project.appendTime)
  if (currentIndex < 0)
    return undefined

  const columnCount = getRenderedGridColumnCount()
  const offset = {
    left: -1,
    right: 1,
    up: -columnCount,
    down: columnCount,
  }[direction]

  const targetIndex = Math.max(0, Math.min(projects.length - 1, currentIndex + offset))
  return projects[targetIndex]
}

function getRenderedGridColumnCount() {
  const firstElement = projectItemRefs.values().next().value
  if (!(firstElement instanceof HTMLElement))
    return 1

  const firstTop = firstElement.getBoundingClientRect().top
  let columnCount = 0

  for (const element of projectItemRefs.values()) {
    if (Math.abs(element.getBoundingClientRect().top - firstTop) <= 4)
      columnCount += 1
  }

  return Math.max(1, columnCount)
}

function isProjectActionDisabled(project: LocalProject, action: ProjectActionKey) {
  // 远程项目没有本地文件夹,“在文件夹中显示”不可用(置灰而非隐藏,保持按钮组对齐)
  if (project.isRemote && action === 'explorer')
    return true
  return !project.isExists && (action === 'open' || action === 'explorer' || action === 'terminal')
}

function firstEnabledProjectAction(project: LocalProject) {
  return PROJECT_ACTION_KEYS.find(action => !isProjectActionDisabled(project, action)) || 'more'
}

function actionButtonTabIndex(project: LocalProject, action: ProjectActionKey) {
  if (isProjectActionDisabled(project, action))
    return -1

  return firstEnabledProjectAction(project) === action ? 0 : -1
}

function projectActionKey(button: HTMLButtonElement) {
  const action = button.dataset.projectAction
  return PROJECT_ACTION_KEYS.includes(action as ProjectActionKey)
    ? action as ProjectActionKey
    : null
}

function toolbarActionButtons(toolbar: HTMLElement) {
  return Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-project-action]'))
    .filter(button => !button.disabled && button.getClientRects().length > 0)
}

function focusToolbarButtonAtIndex(toolbar: HTMLElement, index: number) {
  const buttons = toolbarActionButtons(toolbar)
  if (!buttons.length)
    return

  const targetIndex = Math.max(0, Math.min(buttons.length - 1, index))
  buttons[targetIndex]?.focus({ preventScroll: true })
}

async function focusProjectAction(project: LocalProject | undefined, preferredAction: ProjectActionKey | null, preferredIndex: number) {
  if (!project)
    return

  await ensureProjectRendered(project)

  const toolbar = projectActionRefs.get(project.appendTime)
  if (!toolbar)
    return

  const buttons = toolbarActionButtons(toolbar)
  if (!buttons.length)
    return

  const sameActionButton = preferredAction
    ? buttons.find(button => projectActionKey(button) === preferredAction)
    : undefined
  const fallbackIndex = Math.max(0, Math.min(buttons.length - 1, preferredIndex))
  const target = sameActionButton || buttons[fallbackIndex] || buttons[0]

  target.focus({ preventScroll: true })
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function handleProjectActionsKeydown(project: LocalProject, event: KeyboardEvent) {
  if (event.defaultPrevented)
    return

  if (handleProjectShortcut(project, event))
    return

  const toolbar = event.currentTarget
  if (!(toolbar instanceof HTMLElement))
    return

  const target = event.target instanceof HTMLElement
    ? event.target.closest<HTMLButtonElement>('[data-project-action]')
    : null
  const buttons = toolbarActionButtons(toolbar)
  const currentIndex = target ? buttons.indexOf(target) : -1
  const action = target ? projectActionKey(target) : null

  if (!buttons.length)
    return

  const focusHorizontalAction = (offset: number) => {
    event.preventDefault()
    event.stopPropagation()
    focusToolbarButtonAtIndex(toolbar, currentIndex < 0 ? 0 : currentIndex + offset)
  }

  const focusVerticalAction = (offset: number, direction: 'up' | 'down') => {
    event.preventDefault()
    event.stopPropagation()
    const targetProject = layoutMode.value === 'grid'
      ? findProjectByGridDirection(project, direction, true)
      : findProjectByLinearOffset(project, offset, true)
    focusProjectAction(targetProject, action, currentIndex)
  }

  switch (event.key) {
    case 'ArrowLeft':
      focusHorizontalAction(-1)
      break
    case 'ArrowRight':
      focusHorizontalAction(1)
      break
    case 'ArrowUp':
      focusVerticalAction(-1, 'up')
      break
    case 'ArrowDown':
      focusVerticalAction(1, 'down')
      break
    case 'Home':
      event.preventDefault()
      event.stopPropagation()
      focusToolbarButtonAtIndex(toolbar, 0)
      break
    case 'End':
      event.preventDefault()
      event.stopPropagation()
      focusToolbarButtonAtIndex(toolbar, buttons.length - 1)
      break
  }
}

function handleProjectShortcut(project: LocalProject, event: KeyboardEvent) {
  const usesCommandModifier = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey
  const key = event.key.toLowerCase()

  if (usesCommandModifier && key === 'i') {
    event.preventDefault()
    event.stopPropagation()
    editProject(project)
    return true
  }

  if (usesCommandModifier && key === 'c') {
    event.preventDefault()
    event.stopPropagation()
    void copyProjectPath(project)
    return true
  }

  const isRemoveKey = !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
    && (event.key === 'Delete' || event.key === 'Backspace')
  if (isRemoveKey) {
    event.preventDefault()
    event.stopPropagation()
    showRemoveDialog(project)
    return true
  }

  return false
}

function handleProjectContainerKeydown(project: LocalProject, event: KeyboardEvent) {
  if (event.target !== event.currentTarget)
    return

  if (handleProjectShortcut(project, event))
    return

  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      void openProject(project)
      break
    case ' ':
      event.preventDefault()
      void openProject(project)
      break
    case 'ContextMenu':
      event.preventDefault()
      openProjectContextMenuFromKeyboard(event)
      break
    case 'F10':
      if (!event.shiftKey)
        return
      event.preventDefault()
      openProjectContextMenuFromKeyboard(event)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (layoutMode.value === 'grid')
        focusCardByDirection(project, 'up')
      else
        focusProjectByLinearOffset(project, -1)
      break
    case 'ArrowDown':
      event.preventDefault()
      if (layoutMode.value === 'grid')
        focusCardByDirection(project, 'down')
      else
        focusProjectByLinearOffset(project, 1)
      break
    case 'ArrowLeft':
      if (layoutMode.value !== 'grid')
        return
      event.preventDefault()
      focusCardByDirection(project, 'left')
      break
    case 'ArrowRight':
      if (layoutMode.value !== 'grid')
        return
      event.preventDefault()
      focusCardByDirection(project, 'right')
      break
    case 'Home':
      event.preventDefault()
      focusProjectAtEdge('start')
      break
    case 'End':
      event.preventDefault()
      focusProjectAtEdge('end')
      break
  }
}

async function copyProjectPath(project: LocalProject) {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API is not available')
    }

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
  if (activeTimer) {
    window.clearTimeout(activeTimer)
  }

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

function copyButtonTitle(project: LocalProject) {
  const status = copyFeedback.value[project.appendTime]
  if (status === 'success')
    return t('app.home.actions.copied')
  if (status === 'error')
    return t('app.home.actions.copy_failed')
  return t('app.home.actions.copy_path')
}

function copyButtonIcon(project: LocalProject) {
  const status = copyFeedback.value[project.appendTime]
  if (status === 'success')
    return 'i-lucide:check'
  if (status === 'error')
    return 'i-lucide:x'
  return 'i-lucide:copy'
}

function copyButtonClass(project: LocalProject) {
  const status = copyFeedback.value[project.appendTime]
  return {
    'copy-success': status === 'success',
    'copy-error': status === 'error',
  }
}

function openProjectButtonTitle(project: LocalProject) {
  return isProjectOpening(project)
    ? t('app.home.actions.opening_project')
    : t('app.home.actions.open_project')
}

function openProjectButtonAriaLabel(project: LocalProject) {
  return isProjectOpening(project)
    ? t('app.home.actions.opening_named', { name: project.name })
    : t('app.home.actions.open_named', { name: project.name })
}

function openProjectButtonIcon(project: LocalProject) {
  return isProjectOpening(project)
    ? 'i-lucide:loader-circle spinning'
    : 'i-lucide:external-link'
}

function terminalButtonTitle(project: LocalProject) {
  return isTerminalOpening(project)
    ? t('app.home.actions.opening_terminal')
    : t('app.home.actions.open_terminal')
}

function terminalButtonAriaLabel(project: LocalProject) {
  return isTerminalOpening(project)
    ? t('app.home.actions.opening_terminal_named', { name: project.name })
    : t('app.home.actions.open_terminal')
}

function terminalButtonIcon(project: LocalProject) {
  return isTerminalOpening(project)
    ? 'i-lucide:loader-circle spinning'
    : 'i-lucide:square-terminal'
}

function projectSourceExternalUrl(project: LocalProject) {
  const sourceUrl = projectSourceUrl(project)
  if (!sourceUrl)
    return ''

  const githubName = sourceUrl.match(GITHUB_SOURCE_RE)?.[1]
  if (githubName)
    return `https://github.com/${githubName.replace(/\.git$/, '')}`

  if (/^https?:\/\//i.test(sourceUrl))
    return sourceUrl

  return `https://${sourceUrl}`
}

function sourceNameFromUrl(url: string) {
  const githubName = url.match(GITHUB_SOURCE_RE)?.[1]
  if (githubName)
    return githubName

  try {
    const parsedUrl = new URL(url)
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
    return pathParts.length >= 2
      ? pathParts.slice(-2).join('/')
      : parsedUrl.hostname
  }
  catch {
    return url
  }
}

function projectSourceName(project: LocalProject) {
  const sourceUrl = projectSourceUrl(project)
  return isSourceProject(project)
    ? project.fromName?.trim() || (sourceUrl ? sourceNameFromUrl(sourceUrl) : '')
    : ''
}

function hasProjectSource(project: LocalProject) {
  return !!projectSourceName(project)
}

function projectSourcePrefix(project: LocalProject) {
  return project.kind === ProjectKind.FORK
    ? t('app.home.source.forked_from')
    : t('app.home.source.cloned_from')
}

function projectSourceTitle(project: LocalProject) {
  const sourceName = projectSourceName(project)
  const sourceUrl = projectSourceUrl(project)
  if (sourceName && sourceUrl && sourceName !== sourceUrl)
    return `${projectSourcePrefix(project)} ${sourceName}\n${sourceUrl}`
  return sourceName ? `${projectSourcePrefix(project)} ${sourceName}` : sourceUrl
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

onActivated(() => {
  restoreHomeScrollPosition()
})

onMounted(() => {
  window.addEventListener('project-removed', handleProjectRemoved as EventListener)
  setRemoveAnimationCallback(playProjectRemoveAnimation)
})

onBeforeUnmount(() => {
  window.removeEventListener('project-removed', handleProjectRemoved as EventListener)
  setRemoveAnimationCallback(null)
  copyFeedbackTimers.forEach(timer => window.clearTimeout(timer))
  copyFeedbackTimers.clear()
  projectItemRefs.clear()
  projectActionRefs.clear()
})

function handleProjectRemoved(event: CustomEvent<{ projectId: number }>) {
  clearProjectFromMaps(event.detail.projectId)
}

async function playProjectRemoveAnimation(projectId: number): Promise<void> {
  const element = projectItemRefs.get(projectId)
  if (!element) {
    return
  }

  const htmlElement = element as HTMLElement
  htmlElement.style.transition = 'opacity 180ms ease-out, transform 180ms ease-out'
  htmlElement.style.opacity = '0'
  htmlElement.style.transform = 'translateX(-12px)'

  await new Promise(resolve => setTimeout(resolve, 180))
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
    if (workElapsed < MIN_SYNC_BUSY_MS) {
      await new Promise(resolve => setTimeout(resolve, MIN_SYNC_BUSY_MS - workElapsed))
    }
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

watch(
  renderedProjects,
  (projects) => {
    const livePaths = new Set(projectsStore.allProjects.map(project => project.path))
    pathCache.pruneCache(livePaths)
    projects.forEach((project) => {
      // 远程项目的 path 是 host:remotePath 合成串,不走本地路径格式化
      if (!project.isRemote)
        void pathCache.cacheDisplayPath(project.path)
    })
  },
  { immediate: true },
)

function openSettings() {
  navigateFromHome(ViewEnum.Settings)
}

function openEditorSettings() {
  activatedPage.value = SettingPageEnum.Ides
  navigateFromHome(ViewEnum.Settings)
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

function kindLabel(kind: ProjectKind) {
  switch (kind) {
    case ProjectKind.FORK:
      return t('app.project_kind.fork')
    case ProjectKind.CLONE:
      return t('app.project_kind.clone')
    case ProjectKind.MINE:
    default:
      return t('app.project_kind.mine')
  }
}

function kindClass(kind: ProjectKind) {
  switch (kind) {
    case ProjectKind.FORK:
      return 'kind-fork'
    case ProjectKind.CLONE:
      return 'kind-clone'
    case ProjectKind.MINE:
    default:
      return 'kind-mine'
  }
}

function shortLicense(license?: LicenseEnum) {
  if (!license || license === LicenseEnum.NONE)
    return t('app.license.none')
  if (license === LicenseEnum.MIT)
    return 'MIT'
  if (license === LicenseEnum.APACHE_2_0)
    return 'Apache-2.0'
  if (license === LicenseEnum.GPLV3)
    return 'GPL-3.0'
  if (license === LicenseEnum.GPLV2)
    return 'GPL-2.0'
  if (license === LicenseEnum.OTHER)
    return t('app.license.other')
  return license.replace(' License', '').replace('GNU ', '')
}

function editorIconClasses(editor?: keyof typeof codeEditors | null) {
  if (!editor)
    return []
  const option = codeEditors[editor]
  return ['ide-icon', option?.icon, { 'monochrome-editor-icon': option?.monochromeIcon }]
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function formatLastOpened(project: LocalProject) {
  return project.lastOpenedAt
    ? formatTime(project.lastOpenedAt)
    : t('app.home.table.never_opened')
}

function updateLayoutMode(value: string) {
  layoutMode.value = value as LayoutMode
}

watch(layoutMode, () => {
  resetRenderedProjects()
  persistLayoutMode(layoutMode.value)
})
</script>

<template>
  <main class="workspace-shell" :class="{ 'theme-dark': settingsStore.resolvedTheme === ThemeEnum.Dark }">
    <section class="workspace-topbar">
      <div class="title-block">
        <div class="title-row">
          <h1>
            {{ t('app.home.title') }}
            <span class="count-badge">{{ totalProjects }}</span>
          </h1>
          <button class="icon-button title-settings" type="button" :title="t('app.settings.title')" :aria-label="t('app.settings.title')" @click="openSettings">
            <span class="i-lucide:settings" />
          </button>
        </div>
      </div>

      <div class="topbar-actions">
        <button v-if="settingsStore.scannerEnabled" class="ghost-button" type="button" :disabled="syncing" @click="syncProjects">
          <span class="i-lucide:refresh-cw" :class="{ spinning: syncing }" />
          {{ syncing ? t('app.home.syncing') : t('app.home.sync') }}
        </button>
        <button class="primary-button" type="button" @click="addProject">
          <span class="i-lucide:plus" />
          {{ t('app.home.add_project') }}
        </button>
      </div>
    </section>

    <section class="filter-bar">
      <div class="search-box">
        <span class="i-lucide:search" />
        <input
          v-model="searchValue"
          :aria-label="t('app.home.search_placeholder')"
          :placeholder="t('app.home.search_placeholder')"
          spellcheck="false"
        >
        <button
          v-if="searchValue"
          class="search-clear-button"
          type="button"
          :title="t('app.common.clear')"
          :aria-label="t('app.common.clear')"
          @click="clearSearch"
        >
          <span class="i-lucide:x" />
        </button>
      </div>

      <UiSelect
        v-model="kindFilter"
        :options="kindOptions"
        :placeholder="t('app.home.filters.kind')"
        :aria-label="t('app.home.filters.kind')"
        min-width="128px"
      />

      <UiSelect
        v-model="statusFilter"
        :options="statusOptions"
        :placeholder="t('app.home.filters.status')"
        :aria-label="t('app.home.filters.status')"
        min-width="128px"
      />

      <LanguageFilterSelect
        v-model="languageFilter"
        :options="languageOptions"
        :placeholder="t('app.home.filters.language')"
        :aria-label="t('app.home.filters.language')"
        min-width="150px"
        content-width="210px"
      />

      <UiSelect
        v-model="sortKey"
        :options="sortOptions"
        :placeholder="t('app.home.filters.sort')"
        :aria-label="t('app.home.filters.sort')"
        min-width="122px"
        content-width="170px"
      />

      <button v-if="activeFilterCount" class="clear-button" type="button" @click="clearFilters">
        {{ t('app.home.clear_count', { count: activeFilterCount }) }}
      </button>

      <UiSegmentedControl
        class="layout-switch"
        :model-value="layoutMode"
        :options="layoutOptions"
        :aria-label="t('app.home.layout.label')"
        @update:model-value="updateLayoutMode"
      />
    </section>

    <section class="project-table" :class="`layout-${layoutMode}`" :aria-label="t('app.home.project_list')">
      <div v-if="layoutMode === 'list'" class="project-grid table-head">
        <span>{{ t('app.home.table.project') }}</span>
        <span>{{ t('app.home.table.language') }}</span>
        <span>{{ t('app.home.table.editor') }}</span>
        <span>{{ t('app.home.table.license') }}</span>
        <span>{{ t('app.home.table.last_opened') }}</span>
        <span>{{ t('app.home.table.actions') }}</span>
      </div>

      <div v-if="filteredProjects.length === 0" class="empty-state">
        <strong>{{ t('app.home.empty.title') }}</strong>
        <span>{{ t('app.home.empty.desc') }}</span>
      </div>

      <UiScrollArea v-else-if="layoutMode === 'list'" ref="listScrollAreaRef" class="table-body">
        <UiActionMenu
          v-for="project in renderedProjects"
          :key="project.appendTime"
          mode="context"
          :items="projectMenuItems(project)"
          :aria-label="t('app.home.actions.more')"
          @select="action => handleProjectMenuSelect(project, action)"
        >
          <div
            :ref="el => setProjectItemRef(project.appendTime, el)"
            class="project-grid project-row"
            :class="{ missing: !project.isExists }"
            role="button"
            :tabindex="project.isExists ? 0 : -1"
            :aria-disabled="!project.isExists"
            :aria-label="t('app.home.actions.open_named', { name: project.name })"
            aria-keyshortcuts="Enter Space Shift+F10 Control+I Meta+I Control+C Meta+C Delete Backspace"
            @click="openProject(project)"
            @keydown="handleProjectContainerKeydown(project, $event)"
          >
            <div class="project-main">
              <div class="project-title-line">
                <span class="project-title" :title="project.group ? `${project.group}/${project.name}` : project.name">
                  <span v-if="project.isPinned" class="pinned-marker i-lucide:pin" />
                  <span v-if="project.group" class="project-group-prefix" :title="project.group">{{ project.group }}/</span><span class="project-name" :title="project.name">{{ project.name }}</span>
                </span>
                <span
                  v-if="project.kind !== ProjectKind.MINE"
                  class="kind-badge"
                  :class="kindClass(project.kind)"
                >
                  {{ kindLabel(project.kind) }}
                </span>
                <span v-if="project.isRemote" class="remote-badge" :title="t('app.home.remote.badge')">
                  {{ t('app.home.remote.badge') }}
                </span>
                <span v-if="project.isTemporary" class="temporary-badge" :title="t('app.home.filters.temporary')">
                  {{ t('app.home.filters.temporary') }}
                </span>
              </div>
              <div class="project-path" :title="project.path">
                {{ pathCache.displayProjectPath(project.path) }}
              </div>
              <button
                v-if="projectSourceUrl(project)"
                class="project-source source-link"
                type="button"
                :title="projectSourceTitle(project)"
                :aria-label="`${t('app.home.actions.open_source')}: ${projectSourceName(project)}`"
                @click.stop="openProjectSource(project)"
                @keydown.stop
              >
                <span class="source-prefix">{{ projectSourcePrefix(project) }}</span>
                <span class="source-name">{{ projectSourceName(project) }}</span>
                <span class="source-link-icon i-lucide:external-link" />
              </button>
              <div v-else-if="hasProjectSource(project)" class="project-source" :title="projectSourceTitle(project)">
                <span class="source-prefix">{{ projectSourcePrefix(project) }}</span>
                <span class="source-name">{{ projectSourceName(project) }}</span>
              </div>
            </div>

            <button class="inline-pill" type="button" :title="project.mainLang || t('app.common.unknown')" @click.stop="showLanguage(project, $event)">
              <span class="color-dot" :style="{ background: project.mainLangColor || '#b8b8b8' }" />
              {{ project.mainLang || t('app.common.unknown') }}
            </button>
            <span class="editor-cell" :title="codeEditors[project.defaultOpen]?.label || t('app.common.no_editor')">
              <span :class="editorIconClasses(project.defaultOpen)" />
              <span class="editor-chip-label">{{ codeEditors[project.defaultOpen]?.label || t('app.common.no_editor') }}</span>
            </span>
            <span
              v-if="project.license && project.license !== LicenseEnum.NONE"
              class="license-cell"
            >
              {{ shortLicense(project.license) }}
            </span>
            <span v-else class="license-cell muted">{{ t('app.license.none') }}</span>
            <span class="recent-cell" :class="{ muted: !project.lastOpenedAt }">{{ formatLastOpened(project) }}</span>

            <div
              :ref="el => setProjectActionsRef(project.appendTime, el)"
              class="row-actions"
              role="toolbar"
              aria-orientation="horizontal"
              :aria-label="t('app.home.actions.project_actions', { name: project.name })"
              @keydown="handleProjectActionsKeydown(project, $event)"
            >
              <button
                class="icon-button primary-action"
                :class="{ launching: isProjectOpening(project) }"
                type="button"
                data-project-action="open"
                :title="openProjectButtonTitle(project)"
                :aria-label="openProjectButtonAriaLabel(project)"
                :aria-busy="isProjectOpening(project)"
                :disabled="!project.isExists"
                :tabindex="actionButtonTabIndex(project, 'open')"
                @click.stop="openProject(project)"
              >
                <span :class="openProjectButtonIcon(project)" />
              </button>
              <button
                class="icon-button"
                type="button"
                data-project-action="explorer"
                :title="t('app.home.actions.open_explorer')"
                :aria-label="t('app.home.actions.open_explorer')"
                :disabled="isProjectActionDisabled(project, 'explorer')"
                :tabindex="actionButtonTabIndex(project, 'explorer')"
                @click.stop="openInExplorer(project)"
              >
                <span class="i-lucide:folder" />
              </button>
              <button
                class="icon-button"
                :class="{ 'action-loading': isTerminalOpening(project) }"
                type="button"
                data-project-action="terminal"
                :title="terminalButtonTitle(project)"
                :aria-label="terminalButtonAriaLabel(project)"
                :aria-busy="isTerminalOpening(project)"
                :disabled="!project.isExists"
                :tabindex="actionButtonTabIndex(project, 'terminal')"
                @click.stop="openInTerminal(project)"
              >
                <span :class="terminalButtonIcon(project)" />
              </button>
              <button
                class="icon-button copy-action"
                :class="copyButtonClass(project)"
                type="button"
                data-project-action="copy"
                :title="copyButtonTitle(project)"
                :aria-label="copyButtonTitle(project)"
                :tabindex="actionButtonTabIndex(project, 'copy')"
                @click.stop="copyProjectPath(project)"
              >
                <span :class="copyButtonIcon(project)" />
              </button>
              <UiActionMenu
                :items="projectMenuItems(project)"
                :aria-label="t('app.home.actions.more')"
                @select="action => handleProjectMenuSelect(project, action)"
              >
                <button
                  class="icon-button more-action"
                  type="button"
                  data-project-action="more"
                  :title="t('app.home.actions.more')"
                  :aria-label="t('app.home.actions.more')"
                  :tabindex="actionButtonTabIndex(project, 'more')"
                  @click.stop
                >
                  <span class="i-lucide:more-horizontal" />
                </button>
              </UiActionMenu>
            </div>
          </div>
        </UiActionMenu>
        <div
          v-if="hasMoreProjects"
          :ref="setLoadMoreSentinelRef"
          class="load-more-sentinel"
          aria-hidden="true"
        />
      </UiScrollArea>

      <UiScrollArea v-else ref="cardsScrollAreaRef" class="cards-scroll">
        <div class="cards-body">
          <UiActionMenu
            v-for="project in renderedProjects"
            :key="project.appendTime"
            mode="context"
            :items="projectMenuItems(project)"
            :aria-label="t('app.home.actions.more')"
            @select="action => handleProjectMenuSelect(project, action)"
          >
            <article
              :ref="el => setProjectItemRef(project.appendTime, el)"
              class="project-card"
              :class="{ missing: !project.isExists }"
              role="button"
              :tabindex="project.isExists ? 0 : -1"
              :aria-disabled="!project.isExists"
              :aria-label="t('app.home.actions.open_named', { name: project.name })"
              aria-keyshortcuts="Enter Space Shift+F10 Control+I Meta+I Control+C Meta+C Delete Backspace"
              @click="openProject(project)"
              @keydown="handleProjectContainerKeydown(project, $event)"
            >
              <header class="card-header">
                <div class="card-title">
                  <strong :title="project.group ? `${project.group}/${project.name}` : project.name">
                    <span v-if="project.isPinned" class="pinned-marker i-lucide:pin" />
                    <span v-if="project.group" class="project-group-prefix" :title="project.group">{{ project.group }}/</span><span class="project-name" :title="project.name">{{ project.name }}</span>
                  </strong>
                  <span
                    v-if="project.kind !== ProjectKind.MINE"
                    class="kind-badge"
                    :class="kindClass(project.kind)"
                  >
                    {{ kindLabel(project.kind) }}
                  </span>
                  <span v-if="project.isRemote" class="remote-badge" :title="t('app.home.remote.badge')">
                    {{ t('app.home.remote.badge') }}
                  </span>
                  <span v-if="project.isTemporary" class="temporary-badge" :title="t('app.home.filters.temporary')">
                    {{ t('app.home.filters.temporary') }}
                  </span>
                </div>
              </header>

              <div class="card-path" :title="project.path">
                {{ pathCache.displayProjectPath(project.path) }}
              </div>

              <button
                v-if="projectSourceUrl(project)"
                class="project-source card-source source-link"
                type="button"
                :title="projectSourceTitle(project)"
                :aria-label="`${t('app.home.actions.open_source')}: ${projectSourceName(project)}`"
                @click.stop="openProjectSource(project)"
                @keydown.stop
              >
                <span class="source-prefix">{{ projectSourcePrefix(project) }}</span>
                <span class="source-name">{{ projectSourceName(project) }}</span>
                <span class="source-link-icon i-lucide:external-link" />
              </button>
              <div v-else-if="hasProjectSource(project)" class="project-source card-source" :title="projectSourceTitle(project)">
                <span class="source-prefix">{{ projectSourcePrefix(project) }}</span>
                <span class="source-name">{{ projectSourceName(project) }}</span>
              </div>

              <div class="card-meta">
                <button class="inline-pill" type="button" :title="project.mainLang || t('app.common.unknown')" @click.stop="showLanguage(project, $event)">
                  <span class="color-dot" :style="{ background: project.mainLangColor || '#b8b8b8' }" />
                  {{ project.mainLang || t('app.common.unknown') }}
                </button>
                <span
                  v-if="project.license && project.license !== LicenseEnum.NONE"
                  class="license-cell"
                >
                  {{ shortLicense(project.license) }}
                </span>
                <span v-else class="license-cell muted">{{ t('app.license.none') }}</span>
              </div>

              <footer class="card-footer">
                <span class="editor-chip">
                  <span :class="editorIconClasses(project.defaultOpen)" />
                  <span class="editor-chip-label">{{ codeEditors[project.defaultOpen]?.label || t('app.common.no_editor') }}</span>
                </span>
                <div
                  :ref="el => setProjectActionsRef(project.appendTime, el)"
                  class="row-actions"
                  role="toolbar"
                  aria-orientation="horizontal"
                  :aria-label="t('app.home.actions.project_actions', { name: project.name })"
                  @keydown="handleProjectActionsKeydown(project, $event)"
                >
                  <button
                    class="icon-button primary-action"
                    :class="{ launching: isProjectOpening(project) }"
                    type="button"
                    data-project-action="open"
                    :title="openProjectButtonTitle(project)"
                    :aria-label="openProjectButtonAriaLabel(project)"
                    :aria-busy="isProjectOpening(project)"
                    :disabled="!project.isExists"
                    :tabindex="actionButtonTabIndex(project, 'open')"
                    @click.stop="openProject(project)"
                  >
                    <span :class="openProjectButtonIcon(project)" />
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    data-project-action="explorer"
                    :title="t('app.home.actions.open_explorer')"
                    :aria-label="t('app.home.actions.open_explorer')"
                    :disabled="isProjectActionDisabled(project, 'explorer')"
                    :tabindex="actionButtonTabIndex(project, 'explorer')"
                    @click.stop="openInExplorer(project)"
                  >
                    <span class="i-lucide:folder" />
                  </button>
                  <button
                    class="icon-button"
                    :class="{ 'action-loading': isTerminalOpening(project) }"
                    type="button"
                    data-project-action="terminal"
                    :title="terminalButtonTitle(project)"
                    :aria-label="terminalButtonAriaLabel(project)"
                    :aria-busy="isTerminalOpening(project)"
                    :disabled="!project.isExists"
                    :tabindex="actionButtonTabIndex(project, 'terminal')"
                    @click.stop="openInTerminal(project)"
                  >
                    <span :class="terminalButtonIcon(project)" />
                  </button>
                  <button
                    class="icon-button copy-action"
                    :class="copyButtonClass(project)"
                    type="button"
                    data-project-action="copy"
                    :title="copyButtonTitle(project)"
                    :aria-label="copyButtonTitle(project)"
                    :tabindex="actionButtonTabIndex(project, 'copy')"
                    @click.stop="copyProjectPath(project)"
                  >
                    <span :class="copyButtonIcon(project)" />
                  </button>
                  <UiActionMenu
                    :items="projectMenuItems(project)"
                    :aria-label="t('app.home.actions.more')"
                    @select="action => handleProjectMenuSelect(project, action)"
                  >
                    <button
                      class="icon-button more-action"
                      type="button"
                      data-project-action="more"
                      :title="t('app.home.actions.more')"
                      :aria-label="t('app.home.actions.more')"
                      :tabindex="actionButtonTabIndex(project, 'more')"
                      @click.stop
                    >
                      <span class="i-lucide:more-horizontal" />
                    </button>
                  </UiActionMenu>
                </div>
              </footer>
            </article>
          </UiActionMenu>
          <div
            v-if="hasMoreProjects"
            :ref="setLoadMoreSentinelRef"
            class="load-more-sentinel card-sentinel"
            aria-hidden="true"
          />
        </div>
      </UiScrollArea>
    </section>

    <mainLangPop />
  </main>
</template>

<style lang="scss" scoped>
.workspace-shell {
  @apply size-full overflow-hidden flex flex-col;
  @apply bg-$ui-page-background;
}

.workspace-topbar {
  @apply shrink-0 flex items-center justify-between gap-12px;
  @apply px-14px pt-10px pb-7px;
}

.title-block {
  @apply min-w-0 shrink-0 flex flex-col gap-1px;

  h1 {
    @apply m-0 inline-flex items-center gap-7px text-17px font-650 lh-21px;
  }
}

.title-row {
  @apply min-w-0 flex items-center gap-6px;
}

.topbar-actions {
  @apply shrink-0 flex items-center gap-7px;
}

.clear-button {
  @apply h-30px border-0 rounded-5px px-9px;
  @apply inline-flex items-center gap-6px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.filter-bar {
  @apply shrink-0 flex flex-wrap items-center gap-7px px-14px pb-7px;
}

.search-box {
  @apply h-30px min-w-220px flex-1 rounded-md border;
  @apply flex items-center gap-7px px-9px;
  border-style: solid;
  border-color: var(--ui-input);
  @apply bg-$ui-control-background color-$ui-foreground;
  box-shadow: var(--shadow-control);
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  &:focus-within {
    border-color: var(--ui-ring);
    box-shadow: var(--shadow-focus);
  }

  input {
    @apply min-w-0 flex-1 border-0 bg-transparent outline-none;
    @apply text-12px;
    appearance: none;
    border-style: solid;
    color: var(--ui-foreground);

    &::placeholder {
      color: var(--ui-muted-foreground);
    }
  }
}

.search-clear-button {
  @apply size-18px shrink-0 rounded-full border-0 p-0;
  @apply inline-flex items-center justify-center cursor-pointer text-11px;
  @apply bg-$ui-hover-background color-$ui-muted-foreground;
  @apply hover:color-$ui-foreground;
}

.count-badge {
  @apply shrink-0 size-18px rounded-full px-0;
  @apply inline-flex items-center justify-center;
  @apply text-11px font-650 bg-$ui-hover-background color-$ui-muted-foreground;
}

.spinning {
  animation: spin-sync 0.8s linear infinite;
}

@keyframes spin-sync {
  to {
    transform: rotate(360deg);
  }
}

.clear-button {
  @apply bg-$ui-control-background color-$ui-muted-foreground;
  @apply hover:bg-$ui-hover-background hover:color-$ui-foreground;
}

.project-table {
  @apply min-h-0 mx-14px mb-14px flex-1 overflow-hidden rounded-6px flex flex-col;
  @apply bg-$ui-surface-background;
  box-shadow: var(--shadow-surface);
}

.project-grid {
  @apply grid items-center gap-9px;
  grid-template-columns: minmax(220px, 1.7fr) 110px 140px 104px 122px 136px;
}

/* 加大"编辑器"(第3列)与"许可证"(第4列)之间的间距:只给许可证列加左边距,
   表头与每一行都是 .project-grid 的直接子元素,因此自动保持对齐。 */
.project-grid > :nth-child(4) {
  @apply ml-8px;
}

.table-head {
  @apply h-31px px-12px border-b text-11px uppercase tracking-0;
  @apply light:border-$gray-12 dark:border-$gray-4;
  @apply light:color-$gray-7 dark:color-$gray-8;
}

.table-body {
  @apply min-h-0 flex-1;
}

.project-row {
  @apply min-h-52px px-12px py-6px border-b cursor-pointer;
  @apply light:border-$gray-13 dark:border-$gray-3;
  @apply hover:bg-$ui-hover-background;
  @apply focus-visible:outline-none;
  transition:
    background-color 120ms ease-out,
    box-shadow 120ms ease-out,
    opacity 120ms ease-out;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--ui-ring);
  }

  &.missing {
    @apply cursor-default opacity-78;

    .project-name {
      @apply color-$gray-7;
    }
  }
}

.load-more-sentinel {
  @apply h-1px;
}

.project-main {
  @apply min-w-0 flex flex-col gap-3px;
}

.project-title-line {
  @apply min-w-0 flex items-center gap-7px overflow-hidden;
}

.project-title {
  @apply min-w-0 max-w-full flex items-center overflow-hidden;
  flex: 0 1 auto;
}

.project-group-prefix {
  @apply min-w-0 max-w-[45%] truncate text-12px font-600 light:color-$gray-7 dark:color-$gray-8;
}

.project-name {
  @apply min-w-0 flex-1 truncate text-13px font-620 light:color-$gray-1 dark:color-$gray-13;
}

.temporary-badge {
  @apply h-19px shrink-0 rounded-4px px-5px;
  @apply inline-flex items-center text-10px font-650 lh-12px;
  color: color-mix(in srgb, var(--yellow-2) 84%, var(--gray-1));
  background: color-mix(in srgb, var(--yellow-4) 18%, var(--ui-surface-background));
}

.workspace-shell.theme-dark .temporary-badge {
  color: color-mix(in srgb, var(--yellow-8) 88%, var(--gray-14));
  background: color-mix(in srgb, var(--yellow-5) 16%, var(--ui-surface-background));
}

.remote-badge {
  @apply h-19px shrink-0 rounded-4px px-5px;
  @apply inline-flex items-center text-10px font-650 lh-12px;
  color: color-mix(in srgb, var(--teal-2) 84%, var(--gray-1));
  background: color-mix(in srgb, var(--teal-4) 18%, var(--ui-surface-background));
}

.workspace-shell.theme-dark .remote-badge {
  color: color-mix(in srgb, var(--teal-8) 88%, var(--gray-14));
  background: color-mix(in srgb, var(--teal-5) 16%, var(--ui-surface-background));
}

.pinned-marker {
  @apply mr-4px shrink-0 text-11px color-$ui-primary;
}

.project-path,
.recent-cell {
  @apply truncate text-11px light:color-$gray-7 dark:color-$gray-8;
}

.project-source {
  @apply min-w-0 w-fit max-w-full self-start border-0 bg-transparent p-0 text-11px;
  @apply inline-flex items-center gap-4px text-left;
  @apply light:color-$gray-7 dark:color-$gray-8;
}

.source-prefix {
  @apply shrink-0;
}

.source-name {
  @apply min-w-0 truncate;
}

.source-link {
  @apply cursor-pointer hover:color-$ui-foreground focus-visible:outline-none;
}

.source-link:focus-visible {
  box-shadow: var(--shadow-focus);
}

.source-link-icon {
  @apply size-11px shrink-0 opacity-0;
  transition: opacity 120ms ease-out;
}

.source-link:hover .source-link-icon,
.source-link:focus-visible .source-link-icon {
  @apply opacity-100;
}

.recent-cell.muted {
  @apply color-$ui-muted-foreground;
}

.editor-chip {
  @apply min-w-0 w-fit shrink-0 max-w-180px rounded-4px px-5px py-2px;
  @apply inline-flex items-center gap-4px text-11px;
  @apply bg-$ui-hover-background;

  > span:first-child {
    @apply shrink-0;
  }
}

.editor-chip-label {
  @apply min-w-0 truncate;
}

.project-row > .editor-cell > span:first-child {
  @apply shrink-0;
}

/* 列表视图:中性元数据格(语言/许可证/编辑器)渲染为纯文本,只有"类型"保留彩色标签。
   作用域限定在 .project-row,卡片视图的药丸不受影响。 */
.project-row > .inline-pill,
.project-row > .license-cell,
.project-row > .editor-cell {
  @apply bg-transparent px-0;
}

.project-row > .inline-pill {
  @apply cursor-pointer;

  &:hover {
    @apply underline;
  }
}

.inline-pill,
.license-cell,
.editor-cell {
  @apply min-w-0 max-w-full h-23px rounded-4px px-7px border-0;
  @apply inline-flex items-center gap-5px truncate text-11px;
  @apply bg-$ui-control-background color-$ui-foreground;
}

.inline-pill {
  @apply cursor-pointer hover:bg-$ui-hover-background;
}

.license-cell.muted {
  @apply light:color-$gray-8 dark:color-$gray-7;
}

.color-dot {
  @apply size-8px rounded-full shrink-0;
}

.kind-mine {
  @apply [--kind-color:var(--blue-5)];
  @apply [--kind-bg-light-strength:13%] [--kind-bg-dark-strength:18%];
  @apply [--kind-text-light:var(--blue-5)] [--kind-text-dark:var(--blue-8)];
}

.kind-fork {
  @apply [--kind-color:var(--purple-5)];
  @apply [--kind-bg-light-strength:14%] [--kind-bg-dark-strength:20%];
  @apply [--kind-text-light:color-mix(in_srgb,var(--purple-5)_92%,var(--gray-1))];
  @apply [--kind-text-dark:color-mix(in_srgb,var(--purple-8)_86%,var(--gray-1))];
}

.kind-clone {
  @apply [--kind-color:var(--yellow-5)] [--kind-bg-dark-color:var(--yellow-3)] [--kind-bg-dark-base:var(--gray-1)];
  @apply [--kind-bg-light-strength:27%] [--kind-bg-dark-strength:30%];
  @apply [--kind-text-light:color-mix(in_srgb,var(--yellow-2)_96%,var(--gray-1))];
  @apply [--kind-text-dark:color-mix(in_srgb,var(--yellow-5)_95%,var(--gray-1))];
}

.kind-badge {
  @apply h-19px shrink-0 rounded-4px px-5px;
  @apply inline-flex items-center text-10px font-650 lh-12px;
  @apply [background:color-mix(in_srgb,var(--kind-color)_var(--kind-bg-light-strength),var(--ui-surface-background))];
  @apply [color:var(--kind-text-light)];
}

.workspace-shell.theme-dark .kind-badge {
  @apply [background:color-mix(in_srgb,var(--kind-bg-dark-color,var(--kind-color))_var(--kind-bg-dark-strength),var(--kind-bg-dark-base,var(--ui-surface-background)))];
  @apply [color:var(--kind-text-dark)];
}

.row-actions {
  @apply shrink-0 flex items-center justify-end gap-3px;
}

.icon-button {
  @apply size-23px border-0 rounded-4px p-0;
  @apply inline-flex items-center justify-center cursor-pointer;
  @apply bg-transparent color-$ui-muted-foreground;
  @apply hover:bg-$ui-hover-background hover:color-$ui-foreground;

  > span {
    @apply size-14px;
  }

  &:disabled {
    @apply opacity-35 cursor-not-allowed;
  }

  &.primary-action {
    color: color-mix(in srgb, var(--ui-primary) 58%, var(--ui-muted-foreground));

    &:hover,
    &:focus-visible {
      @apply color-$ui-primary;
    }
  }

  &.launching {
    color: var(--ui-primary);
    cursor: progress;
  }

  &.action-loading {
    @apply color-$ui-foreground;
    cursor: progress;
  }

  &.danger {
    @apply color-$red-5;
  }

  &.copy-success {
    @apply color-$green-5;
  }

  &.copy-error {
    @apply color-$red-5;
  }
}

.icon-button.title-settings {
  @apply size-26px rounded-5px bg-transparent;
  @apply hover:bg-$ui-hover-background;
}

.cards-scroll {
  @apply min-h-0 flex-1;
}

.cards-body {
  @apply min-h-full p-12px;
  @apply grid gap-12px content-start;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
}

.card-sentinel {
  @apply col-span-full;
}

.project-card {
  @apply min-w-0 rounded-6px border p-12px cursor-pointer;
  @apply flex flex-col;
  @apply border-$ui-border bg-$ui-control-background;
  @apply hover:bg-$ui-hover-background;
  @apply focus-visible:outline-none;
  box-shadow: var(--shadow-surface);
  transition:
    background-color 120ms ease-out,
    border-color 120ms ease-out,
    box-shadow 120ms ease-out,
    opacity 120ms ease-out,
    transform 120ms ease-out;

  &:hover {
    box-shadow: var(--shadow-surface-hover);
    transform: translateY(-1px);
  }

  &:focus-visible {
    box-shadow: var(--shadow-focus), var(--shadow-surface-hover);
  }

  &.missing {
    @apply cursor-default opacity-78;
    box-shadow: var(--shadow-surface);
    transform: none;

    .card-title strong {
      @apply color-$gray-7;
    }
  }
}

.card-header,
.card-footer,
.card-meta {
  @apply min-w-0 flex items-center gap-9px;
}

.card-header {
  @apply justify-between;
}

.card-title {
  @apply min-w-0 flex-1 flex items-center gap-7px;

  strong {
    @apply min-w-0 flex-1 inline-flex items-center truncate text-13px font-650 light:color-$gray-1 dark:color-$gray-13;
  }
}

.card-path {
  @apply my-9px truncate text-11px light:color-$gray-6 dark:color-$gray-8;
}

.card-source {
  @apply -mt-4px mb-9px;
}

.card-meta {
  @apply mt-auto flex-wrap;
}

.card-footer {
  @apply mt-12px grid;
  grid-template-columns: minmax(0, 1fr) max-content;

  .editor-chip {
    @apply w-fit max-w-180px shrink justify-self-start;
  }

  .row-actions {
    @apply opacity-0 pointer-events-none;
    transition: opacity 120ms ease;
  }
}

.project-card:hover,
.project-card:focus,
.project-card:focus-within {
  .card-footer .row-actions {
    @apply opacity-100 pointer-events-auto;
  }
}

.empty-state {
  @apply h-full flex flex-col items-center justify-center gap-5px;
  @apply light:color-$gray-6 dark:color-$gray-8;

  strong {
    @apply text-14px light:color-$gray-2 dark:color-$gray-12;
  }
}

@media (max-width: 1020px) {
  .project-grid {
    grid-template-columns: minmax(220px, 1fr) 104px 140px 112px 136px;
  }

  .project-grid > :nth-child(5) {
    display: none;
  }
}

@media (max-width: 760px) {
  .workspace-topbar {
    @apply items-start;
  }

  .topbar-actions {
    @apply flex-wrap justify-end;
  }

  .filter-bar {
    @apply flex-wrap;
  }

  .search-box {
    @apply flex-none w-220px min-w-220px;
  }

  .layout-switch {
    @apply flex-none justify-center;
  }

  .clear-button {
    @apply shrink-0;
  }

  .project-grid {
    grid-template-columns: minmax(210px, 1fr) 136px;
  }

  .project-grid > :nth-child(2),
  .project-grid > :nth-child(3),
  .project-grid > :nth-child(4),
  .project-grid > :nth-child(5) {
    display: none;
  }
}

@media (max-width: 560px) {
  .workspace-topbar {
    @apply gap-8px px-10px pt-8px pb-6px;
  }

  .title-block .count-badge {
    @apply inline-flex;
  }

  .topbar-actions {
    @apply gap-5px;
  }

  .primary-button,
  .ghost-button,
  .clear-button {
    @apply px-7px;
  }

  .project-table {
    @apply mx-10px mb-10px;
  }

  .filter-bar {
    @apply px-10px gap-5px;
  }

  .search-box {
    @apply w-188px min-w-188px;
  }

  .project-grid {
    grid-template-columns: minmax(180px, 1fr) 84px;
  }

  .row-actions .icon-button:not(.primary-action):not(.copy-action):not(.more-action) {
    display: none;
  }

  .row-actions {
    @apply gap-2px;
  }

  .icon-button {
    @apply size-22px;
  }
}
</style>
