import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { LocalProject, ProjectKind, ProjectLanguage } from '~/constants/localProject'
import { createPersistence } from '~/stores/helpers/persistence'
import { normalizePathKey, stripWindowsVerbatimPrefix } from '~/utils/path'

const projectsPersistence = createPersistence<LocalProject[]>({
  key: 'projects',
  serialize: data =>
    JSON.stringify(data, (key, value) => {
      if (key === 'group' && value === '')
        return undefined
      if (key === 'isTemporary' && value !== true)
        return undefined
      if (key === 'isPinned' && value !== true)
        return undefined
      if (key === 'isArchived' && value !== true)
        return undefined
      if (key === 'license' && value === 'None')
        return undefined
      return value
    }),
})

const PROJECT_EXISTENCE_CONCURRENCY = 12

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>,
) {
  let nextIndex = 0
  const workerCount = Math.min(concurrency, items.length)

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex]
      nextIndex += 1
      await task(item)
    }
  }))
}

function normalizeProject(project: LocalProject): LocalProject {
  const lastOpenedAt = Number.isFinite(project.lastOpenedAt) ? project.lastOpenedAt : undefined
  const path = stripWindowsVerbatimPrefix(project.path || '')

  // 快速检查:如果所有关键字段都已正确,直接返回
  if (
    project.path === path
    && project.lastOpenedAt === lastOpenedAt
    && typeof project.group === 'string'
    && typeof project.isTemporary === 'boolean'
    && typeof project.isPinned === 'boolean'
    && typeof project.isArchived === 'boolean'
    && typeof project.isExists === 'boolean'
    && Array.isArray(project.langGroup)
  ) {
    return project
  }

  return {
    ...project,
    path,
    lastOpenedAt,
    group: project.group || '',
    isTemporary: !!project.isTemporary,
    isPinned: !!project.isPinned,
    isArchived: !!project.isArchived,
    isExists: project.isExists ?? true,
    langGroup: project.langGroup || [],
  }
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<LocalProject[]>([])
  const loaded = ref(false)
  let loadingPromise: Promise<void> | null = null

  const allProjects = computed(() => projects.value)
  const activeProjects = computed(() => projects.value.filter(project => !project.isArchived))
  const archivedProjects = computed(() => projects.value.filter(project => project.isArchived))
  const tempProjects = computed(() => projects.value.filter(project => project.isTemporary))

  const mainLangSummary = computed(() => {
    const langMap = new Map<ProjectLanguage, { color: `#${string}`, count: number }>()

    for (const project of projects.value) {
      const lang = project.mainLang || 'unknown'
      const color = project.mainLangColor ?? '#ccc'
      const current = langMap.get(lang)
      if (current) {
        current.count += 1
      }
      else {
        langMap.set(lang, { color, count: 1 })
      }
    }

    return Array.from(langMap.entries()).map(([text, { color, count }]) => ({
      text,
      color,
      count,
    }))
  })

  const allGroups = computed(() => {
    const groupSet = new Set<string>()
    for (const project of projects.value) {
      if (project.group?.trim()) {
        groupSet.add(project.group)
      }
    }
    return Array.from(groupSet).sort((a, b) => a.localeCompare(b))
  })

  async function addProject(newProject: LocalProject, save?: boolean) {
    const project = normalizeProject(newProject)
    project.isExists = await checkProjectExistence(project)
    projects.value.unshift(project)
    if (save) {
      await saveProjects()
    }
  }

  function getProjectByAppendTime(appendTime: LocalProject['appendTime']) {
    return projects.value.find(project => project.appendTime === appendTime)
  }

  function getProjectsByKind(kind: ProjectKind) {
    return projects.value.filter(project => project.kind === kind)
  }

  function getProjectsByLang(lang: ProjectLanguage) {
    return projects.value.filter(project => project.mainLang === lang)
  }

  async function updateProject(
    appendTime: LocalProject['appendTime'],
    updatedProject: LocalProject,
  ) {
    const index = projects.value.findIndex(project => project.appendTime === appendTime)
    if (index === -1) {
      return false
    }

    const project = normalizeProject({
      ...updatedProject,
      isPinned: updatedProject.isPinned ?? projects.value[index].isPinned,
      isArchived: updatedProject.isArchived ?? projects.value[index].isArchived,
      lastOpenedAt: updatedProject.lastOpenedAt ?? projects.value[index].lastOpenedAt,
    })
    project.isExists = await checkProjectExistence(project)
    projects.value[index] = project

    await saveProjects()
    return true
  }

  async function removeProject(appendTime: LocalProject['appendTime']) {
    const index = projects.value.findIndex(project => project.appendTime === appendTime)
    if (index === -1)
      return false

    const projectId = projects.value[index].appendTime
    projects.value.splice(index, 1)
    await saveProjects()

    // 通知视图清理相关的 Map 条目
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('project-removed', { detail: { projectId } }))
    }

    return true
  }

  async function toggleProjectPinned(appendTime: LocalProject['appendTime']) {
    const project = getProjectByAppendTime(appendTime)
    if (!project)
      return false

    project.isPinned = !project.isPinned
    await saveProjects()
    return true
  }

  async function toggleProjectArchived(appendTime: LocalProject['appendTime']) {
    const project = getProjectByAppendTime(appendTime)
    if (!project)
      return false

    project.isArchived = !project.isArchived
    await saveProjects()
    return true
  }

  async function setProjectDefaultOpen(
    appendTime: LocalProject['appendTime'],
    defaultOpen: LocalProject['defaultOpen'],
  ) {
    const project = getProjectByAppendTime(appendTime)
    if (!project)
      return false

    if (project.defaultOpen === defaultOpen)
      return true

    project.defaultOpen = defaultOpen
    await saveProjects()
    return true
  }

  function clearProjects() {
    projects.value.splice(0, projects.value.length)
  }

  async function saveProjects() {
    try {
      await projectsPersistence.save(projects.value)
    }
    catch (error: unknown) {
      console.error('Error saving project data:', error)
    }
  }

  function setProjects(loadedData: LocalProject[]) {
    const normalized = loadedData.map(normalizeProject)
    projects.value.splice(0, projects.value.length, ...normalized)
    loaded.value = true
  }

  async function loadProjects() {
    if (loadingPromise)
      return loadingPromise

    const cachedData = projectsPersistence.loadCached()
    if (cachedData)
      setProjects(cachedData)

    loadingPromise = loadProjectsFromDisk().finally(() => {
      loadingPromise = null
    })
    return loadingPromise
  }

  async function loadProjectsFromDisk() {
    try {
      const loadedData = await projectsPersistence.load()
      if (!loadedData) {
        projects.value.splice(0, projects.value.length)
        loaded.value = true
        return
      }

      setProjects(loadedData)
      void refreshProjectExistence().catch((error) => {
        console.error('Error refreshing project existence:', error)
      })
    }
    catch (error: unknown) {
      console.error('Error loading project data:', error)
      loaded.value = true
    }
  }

  function checkPathExistenceInProjects(
    path: LocalProject['path'],
    excludedPaths: LocalProject['path'][] = [],
  ) {
    const targetPath = normalizePathKey(path)
    const excluded = new Set(excludedPaths.map(normalizePathKey))
    return projects.value.some((project) => {
      const projectPath = normalizePathKey(project.path)
      return projectPath === targetPath && !excluded.has(projectPath)
    })
  }

  async function checkProjectExistence(project: LocalProject): Promise<boolean> {
    const { exists } = await window.api.checkPathExistence(project.path)
    return exists
  }

  async function refreshProjectExistence() {
    const snapshot = projects.value.map(project => ({
      appendTime: project.appendTime,
      path: project.path,
      isExists: project.isExists,
    }))
    const existenceByProjectId = new Map<LocalProject['appendTime'], boolean>()

    await runWithConcurrency(snapshot, PROJECT_EXISTENCE_CONCURRENCY, async (project) => {
      try {
        const { exists } = await window.api.checkPathExistence(project.path)
        existenceByProjectId.set(project.appendTime, exists)
      }
      catch (error: unknown) {
        console.error(`Error checking project path '${project.path}':`, error)
        existenceByProjectId.set(project.appendTime, project.isExists)
      }
    })

    // 按 appendTime 回写,仅更新快照中存在的项目
    let changedCount = 0
    const snapshotIds = new Set(snapshot.map(p => p.appendTime))
    const nextProjects = projects.value.map((project) => {
      if (!snapshotIds.has(project.appendTime)) {
        // 快照后新增的项目,保持原状
        return project
      }

      const isExists = existenceByProjectId.get(project.appendTime)
      if (isExists === undefined || isExists === project.isExists)
        return project

      changedCount += 1
      return { ...project, isExists }
    })

    if (changedCount > 0)
      projects.value.splice(0, projects.value.length, ...nextProjects)

    return changedCount
  }

  async function markProjectOpened(appendTime: LocalProject['appendTime'], openedAt = Date.now()) {
    const project = getProjectByAppendTime(appendTime)
    if (!project)
      return false

    project.lastOpenedAt = openedAt
    await saveProjects()
    return true
  }

  return {
    projects,
    loaded,
    allProjects,
    activeProjects,
    archivedProjects,
    tempProjects,
    mainLangSummary,
    allGroups,
    addProject,
    getProjectByAppendTime,
    getProjectsByKind,
    getProjectsByLang,
    updateProject,
    removeProject,
    toggleProjectPinned,
    toggleProjectArchived,
    setProjectDefaultOpen,
    clearProjects,
    saveProjects,
    loadProjects,
    checkPathExistenceInProjects,
    checkProjectExistence,
    refreshProjectExistence,
    markProjectOpened,
  }
})
