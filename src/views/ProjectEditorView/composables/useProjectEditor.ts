import { useI18n } from 'vue-i18n'

import { ViewEnum } from '~/constants/appEnums'
import type { CodeEditorEnum, CodeEditorOption } from '~/constants/codeEditor'
import { codeEditorOrder, codeEditors, isVscodeHistoryScannerEditor } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { languagesGroupItem, LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { LanguageAnalyzer } from '~/services/languageAnalyzer'
import { detectLicenseBySnippet } from '~/services/licenseDetector'
import { useEditorLangGroupsStore } from '~/stores/editorLangGroupsStore'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { kindLabel, shortLicense } from '~/utils/projectFormatters'
import { extractGithubRepositoryName } from '~/utils/projectSource'
import { useDelayedBusy } from '~/utils/useDelayedBusy'

import {
  initializeNewProjectState,
  isUpdateProject,
  localProjectItem,
} from '../ProjectEditorViewProvider'

export type ProjectEditorFieldKey
  = | 'path'
    | 'name'
    | 'mainLang'
    | 'defaultOpen'
    | 'fromUrl'
    | 'fromName'
    | 'remoteHost'
    | 'remotePath'

const PATH_SPLIT_RE = /[\\/]+/
const languageColorCache = new Map<string, LocalProject['mainLangColor'] | null>()

function findLanguageColor(
  language: string | null | undefined,
  langGroup: languagesGroupItem[] | null | undefined,
) {
  return langGroup?.find(item => item.text === language)?.color || null
}

async function resolveLanguageColor(
  language: string | null | undefined,
  langGroup: languagesGroupItem[] | null | undefined,
) {
  if (!language)
    return null

  const localColor = findLanguageColor(language, langGroup)
  if (localColor)
    return localColor

  if (languageColorCache.has(language))
    return languageColorCache.get(language) || null

  try {
    const color = await window.api.getLanguageColor(language)
    languageColorCache.set(language, color)
    return color
  }
  catch (error: unknown) {
    console.warn(`Failed to resolve language color for '${language}':`, error)
    languageColorCache.set(language, null)
    return null
  }
}

export function useProjectEditor() {
  const activatedView = inject('activatedView') as Ref<ViewEnum>
  const projectsStore = useProjectsStore()
  const projectScannerStore = useProjectScannerStore()
  const editorLangGroupsStore = useEditorLangGroupsStore()
  const initialProjectPath = localProjectItem.value.path || ''
  const initialProjectId = localProjectItem.value.appendTime
  const { t } = useI18n()

  const isRemote = computed(() => !!localProjectItem.value.isRemote)
  const analyzing = ref(false)
  const detectingLicense = ref(false)
  const visibleAnalyzing = useDelayedBusy(analyzing, { delay: 220, minDuration: 320 })
  const lastAnalyzedPath = ref(initialProjectPath)
  const touchedFields = reactive<Record<ProjectEditorFieldKey, boolean>>({
    path: false,
    name: false,
    mainLang: false,
    defaultOpen: false,
    fromUrl: false,
    fromName: false,
    remoteHost: false,
    remotePath: false,
  })

  const editorRows = computed<Array<[CodeEditorEnum, CodeEditorOption]>>(() =>
    codeEditorOrder.map(editor => [editor, codeEditors[editor]]),
  )

  function editorGroupLabel(option: CodeEditorOption) {
    return t(option.groupKey)
  }

  const editorOptions = computed(() =>
    editorRows.value
      .filter(([editor]) => !isRemote.value || isVscodeHistoryScannerEditor(editor))
      .map(([editor, option]) => ({
        value: editor,
        label: `${editorGroupLabel(option)} / ${option.label}`,
      })),
  )

  const modeOptions = computed(() => [
    { value: 'local', label: t('app.project_editor.mode.local') },
    { value: 'remote', label: t('app.project_editor.mode.remote') },
  ])

  const projectMode = computed(() => (isRemote.value ? 'remote' : 'local'))

  const licenseOptions = computed(() =>
    [
      LicenseEnum.NONE,
      ...Object.values(LicenseEnum).filter(value => value !== LicenseEnum.NONE),
    ].map(value => ({
      value,
      label: shortLicense(value, t),
    })),
  )

  const projectKindOptions = computed(() =>
    [ProjectKind.MINE, ProjectKind.FORK, ProjectKind.CLONE].map(kind => ({
      value: kind,
      label: kindLabel(kind, t),
    })),
  )

  const languageOptions = computed(() =>
    (localProjectItem.value.langGroup || [])
      .filter(language => language.text !== 'Other')
      .map(language => language.text),
  )

  const repositoryFolderName = computed(() => {
    const source = isRemote.value ? localProjectItem.value.remotePath : localProjectItem.value.path
    return source
      ? source.split(PATH_SPLIT_RE).filter(Boolean).at(-1) || ''
      : ''
  })

  const effectivePath = computed(() => {
    if (!isRemote.value)
      return localProjectItem.value.path || ''
    const host = localProjectItem.value.remoteHost?.trim()
    const remotePath = localProjectItem.value.remotePath?.trim()
    return host && remotePath ? `${host}:${remotePath}` : ''
  })

  const duplicatePath = computed(() =>
    !!effectivePath.value
    && projectsStore.checkPathExistenceInProjects(
      effectivePath.value,
      isUpdateProject.value && initialProjectPath ? [initialProjectPath] : [],
    ),
  )

  const sourceSuggestion = computed(() => {
    const url = localProjectItem.value.fromUrl?.trim()
    if (!url)
      return ''
    return extractGithubRepositoryName(url)
  })

  const canSave = computed(() => {
    if (isRemote.value) {
      return !!localProjectItem.value.remoteHost
        && !!localProjectItem.value.remotePath
        && !!localProjectItem.value.name
        && !!localProjectItem.value.defaultOpen
    }
    return !!localProjectItem.value.path
      && !!localProjectItem.value.name
      && !!localProjectItem.value.mainLang
      && !!localProjectItem.value.defaultOpen
  })

  const folderStatus = computed(() =>
    duplicatePath.value ? t('app.project_editor.fields.folder_duplicate') : '',
  )

  const mainLanguageStatus = computed(() =>
    visibleAnalyzing.value ? t('app.project_editor.analyzing_desc') : '',
  )

  const summaryItems = computed(() => [
    { label: t('app.project_editor.summary.kind'), value: kindLabel(localProjectItem.value.kind, t) },
    { label: t('app.project_editor.summary.editor'), value: localProjectItem.value.defaultOpen ? codeEditors[localProjectItem.value.defaultOpen]?.label : t('app.common.not_set') },
    { label: t('app.project_editor.summary.license'), value: shortLicense(localProjectItem.value.license as LicenseEnum, t) },
  ])

  async function browseProjectPath() {
    const selectedPath = await window.api.openFolderDialog()
    if (!selectedPath)
      return

    localProjectItem.value.path = selectedPath
    touchedFields.path = true
    await refreshDetectedProjectMetadata()
  }

  function handlePathBlur() {
    markTouched('path')
    void refreshDetectedProjectMetadata()
  }

  function fillProjectName() {
    if (repositoryFolderName.value) {
      localProjectItem.value.name = repositoryFolderName.value
      touchedFields.name = true
    }
  }

  function fillSourceName() {
    if (sourceSuggestion.value) {
      localProjectItem.value.fromName = sourceSuggestion.value
      touchedFields.fromName = true
    }
  }

  function markTouched(field: ProjectEditorFieldKey) {
    touchedFields[field] = true
  }

  function hasDetectedMetadata() {
    return !!localProjectItem.value.mainLang && !!localProjectItem.value.defaultOpen
  }

  function fillDefaultEditorFromLanguage(language: string | null | undefined) {
    if (!language || localProjectItem.value.defaultOpen)
      return

    localProjectItem.value.defaultOpen = editorLangGroupsStore.getEditorByLanguage(language)
  }

  function resetDetectedProjectMetadata() {
    localProjectItem.value.mainLang = null
    localProjectItem.value.mainLangColor = null
    localProjectItem.value.langGroup = []
    localProjectItem.value.defaultOpen = null
    localProjectItem.value.license = LicenseEnum.NONE
  }

  async function refreshDetectedProjectMetadata() {
    const path = localProjectItem.value.path?.trim()
    if (!path)
      return
    if (path === lastAnalyzedPath.value && hasDetectedMetadata())
      return

    if (!localProjectItem.value.name)
      localProjectItem.value.name = repositoryFolderName.value

    resetDetectedProjectMetadata()
    lastAnalyzedPath.value = path

    await Promise.all([
      analyzeProject(path),
      detectProjectGitMetadata(path),
      detectLicense(path),
    ])
  }

  async function detectProjectGitMetadata(targetPath = localProjectItem.value.path) {
    const path = targetPath?.trim()
    if (!path)
      return

    try {
      const metadata = await window.api.detectProjectGitMetadata(path)
      if (localProjectItem.value.path?.trim() !== path)
        return

      localProjectItem.value.kind = metadata?.kind || ProjectKind.MINE
      if (localProjectItem.value.kind === ProjectKind.MINE) {
        if (!touchedFields.fromUrl)
          localProjectItem.value.fromUrl = null
        if (!touchedFields.fromName)
          localProjectItem.value.fromName = null
        return
      }

      if (!touchedFields.fromUrl)
        localProjectItem.value.fromUrl = metadata?.fromUrl || null
      if (!touchedFields.fromName)
        localProjectItem.value.fromName = metadata?.fromName || null
    }
    catch (error: unknown) {
      console.warn(`Failed to detect Git metadata for '${path}':`, error)
    }
  }

  async function analyzeProject(
    targetPath = localProjectItem.value.path,
    options: { persistGlobal?: boolean } = {},
  ) {
    const path = targetPath
    if (!path)
      return

    analyzing.value = true
    try {
      const analyzer = new LanguageAnalyzer(path)
      const success = await analyzer.analyze()
      if (!success)
        return
      if (localProjectItem.value.path !== path)
        return

      localProjectItem.value.langGroup = analyzer.langGroup
      if (!localProjectItem.value.mainLang)
        localProjectItem.value.mainLang = analyzer.mainLang
      if (!localProjectItem.value.mainLangColor) {
        const color = await resolveLanguageColor(localProjectItem.value.mainLang, analyzer.langGroup)
        if (localProjectItem.value.path !== path)
          return
        localProjectItem.value.mainLangColor = color
      }
      fillDefaultEditorFromLanguage(localProjectItem.value.mainLang)

      if (options.persistGlobal && canPersistLanguageAnalysis(path))
        await projectsStore.updateProjectLanguageMetadata(initialProjectId!, analyzer.langGroup)
    }
    finally {
      analyzing.value = false
    }
  }

  function runAnalyzeProject() {
    void analyzeProject(localProjectItem.value.path, { persistGlobal: true })
  }

  function canPersistLanguageAnalysis(path: string) {
    return isUpdateProject.value
      && initialProjectId !== null
      && path === initialProjectPath
  }

  async function detectLicense(targetPath = localProjectItem.value.path) {
    const path = targetPath
    if (!path)
      return

    detectingLicense.value = true
    try {
      const res = await window.api.readProjectLicense(path)
      if (!res?.success || !res.snippet)
        return
      if (localProjectItem.value.path !== path)
        return

      const { license, score } = detectLicenseBySnippet(res.snippet)
      if (license && score > 0)
        localProjectItem.value.license = license
    }
    finally {
      detectingLicense.value = false
    }
  }

  function runDetectLicense() {
    void detectLicense()
  }

  async function updateLanguage(language: string | null) {
    localProjectItem.value.mainLang = language
    const color = await resolveLanguageColor(language, localProjectItem.value.langGroup)
    if (localProjectItem.value.mainLang !== language)
      return
    localProjectItem.value.mainLangColor = color
    fillDefaultEditorFromLanguage(language)
  }

  async function hydrateLanguageMixFromCache() {
    const path = localProjectItem.value.path
    if (!path || localProjectItem.value.langGroup?.length)
      return

    await projectScannerStore.loadProjectScannerData()
    const cached = projectScannerStore.getScanCacheEntry(path)
    if (!cached?.langGroup?.length)
      return
    if (localProjectItem.value.path !== path)
      return

    localProjectItem.value.langGroup = cached.langGroup
    localProjectItem.value.mainLang = localProjectItem.value.mainLang || cached.mainLang || cached.langGroup[0]?.text || null
    localProjectItem.value.mainLangColor = localProjectItem.value.mainLangColor
      || await resolveLanguageColor(localProjectItem.value.mainLang, cached.langGroup)
      || (localProjectItem.value.mainLang === cached.mainLang ? cached.mainLangColor : undefined)
    fillDefaultEditorFromLanguage(localProjectItem.value.mainLang)
  }

  function validateFields() {
    touchedFields.name = true
    touchedFields.defaultOpen = true
    if (isRemote.value) {
      touchedFields.remoteHost = true
      touchedFields.remotePath = true
    }
    else {
      touchedFields.path = true
      touchedFields.mainLang = true
    }
    return canSave.value && !duplicatePath.value
  }

  function toProject(): LocalProject {
    const remote = isRemote.value
    const remoteHost = localProjectItem.value.remoteHost?.trim() || undefined
    const remotePath = localProjectItem.value.remotePath?.trim() || undefined
    const isSourceProject = localProjectItem.value.kind !== ProjectKind.MINE
    const fromUrl = isSourceProject ? localProjectItem.value.fromUrl?.trim() || undefined : undefined
    const fromName = isSourceProject ? localProjectItem.value.fromName?.trim() || undefined : undefined
    return {
      appendTime: localProjectItem.value.appendTime || Date.now(),
      lastOpenedAt: localProjectItem.value.lastOpenedAt ?? undefined,
      path: remote ? effectivePath.value : localProjectItem.value.path!,
      name: localProjectItem.value.name!,
      group: localProjectItem.value.group || '',
      kind: localProjectItem.value.kind,
      fromUrl,
      fromName,
      mainLang: remote ? (localProjectItem.value.mainLang || '') : localProjectItem.value.mainLang!,
      mainLangColor: localProjectItem.value.mainLangColor || undefined,
      langGroup: localProjectItem.value.langGroup || [],
      defaultOpen: localProjectItem.value.defaultOpen!,
      license: localProjectItem.value.license !== LicenseEnum.NONE
        ? localProjectItem.value.license as LicenseEnum
        : undefined,
      isTemporary: !!localProjectItem.value.isTemporary,
      isPinned: !!localProjectItem.value.isPinned,
      isExists: true,
      isRemote: remote || undefined,
      remoteHost: remote ? remoteHost : undefined,
      remotePath: remote ? remotePath : undefined,
    }
  }

  async function saveProject() {
    if (!validateFields())
      return

    const project = toProject()
    if (isUpdateProject.value)
      await projectsStore.updateProject(project.appendTime, project)
    else
      await projectsStore.addProject(project, true)
    closeEditor()
  }

  function closeEditor() {
    initializeNewProjectState()
    activatedView.value = ViewEnum.Home
  }

  function updateProjectKind(kind: string) {
    localProjectItem.value.kind = kind as ProjectKind
  }

  function setProjectMode(mode: string) {
    const remote = mode === 'remote'
    if (remote === !!localProjectItem.value.isRemote)
      return

    localProjectItem.value.isRemote = remote
    if (remote) {
      localProjectItem.value.path = null
      if (localProjectItem.value.defaultOpen && !isVscodeHistoryScannerEditor(localProjectItem.value.defaultOpen))
        localProjectItem.value.defaultOpen = null
    }
    else {
      localProjectItem.value.remoteHost = null
      localProjectItem.value.remotePath = null
    }
  }

  function fieldInvalid(field: ProjectEditorFieldKey) {
    return touchedFields[field] && !localProjectItem.value[field]
  }

  watch(
    () => localProjectItem.value.path,
    (path, oldPath) => {
      if (path === oldPath)
        return
      if (!path)
        lastAnalyzedPath.value = ''
      touchedFields.fromUrl = false
      touchedFields.fromName = false
      resetDetectedProjectMetadata()
    },
    { flush: 'sync' },
  )

  watch(
    () => localProjectItem.value.mainLang,
    language => void updateLanguage(language),
  )

  onMounted(() => {
    void hydrateLanguageMixFromCache()
  })

  return {
    analyzing,
    browseProjectPath,
    canSave,
    closeEditor,
    detectingLicense,
    duplicatePath,
    effectivePath,
    editorOptions,
    fieldInvalid,
    fillProjectName,
    fillSourceName,
    folderStatus,
    handlePathBlur,
    isRemote,
    languageOptions,
    licenseOptions,
    mainLanguageStatus,
    markTouched,
    modeOptions,
    projectKindOptions,
    projectMode,
    projectsStore,
    repositoryFolderName,
    runAnalyzeProject,
    runDetectLicense,
    saveProject,
    setProjectMode,
    sourceSuggestion,
    summaryItems,
    updateProjectKind,
    visibleAnalyzing,
  }
}
