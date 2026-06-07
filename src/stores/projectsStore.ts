import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { LocalProject, ProjectKind, ProjectLanguage } from '~/constants/localProject'
import { createPersistence } from '~/stores/helpers/persistence'

const projectsPersistence = createPersistence<LocalProject[]>({
  key: 'projects',
  serialize: data =>
    JSON.stringify(data, (key, value) => {
      if (key === 'group' && value === '')
        return undefined
      if (key === 'langGroup' || key === 'isExists')
        return undefined
      if (key === 'isTemporary' && value !== true)
        return undefined
      if (key === 'isPinned' && value !== true)
        return undefined
      if (key === 'license' && value === 'None')
        return undefined
      return value
    }),
})

const TRAILING_SLASH_RE = /\/+$/
const WINDOWS_VERBATIM_UNC_RE = /^\\\\\?\\UNC\\/
const WINDOWS_VERBATIM_RE = /^\\\\\?\\/

function stripWindowsVerbatimPrefix(path: string) {
  if (WINDOWS_VERBATIM_UNC_RE.test(path))
    return path.replace(WINDOWS_VERBATIM_UNC_RE, '\\\\')
  return path.replace(WINDOWS_VERBATIM_RE, '')
}

function normalizeProject(project: LocalProject): LocalProject {
  return {
    ...project,
    path: stripWindowsVerbatimPrefix(project.path || ''),
    group: project.group || '',
    isTemporary: !!project.isTemporary,
    isPinned: !!project.isPinned,
    isExists: project.isExists ?? true,
    langGroup: project.langGroup || [],
  }
}

function normalizePathForCompare(path: string) {
  const normalized = stripWindowsVerbatimPrefix(path).trim().replaceAll('\\', '/').replace(TRAILING_SLASH_RE, '')
  return navigator.userAgent.includes('Windows') ? normalized.toLowerCase() : normalized
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<LocalProject[]>([])
  const loaded = ref(false)
  let loadingPromise: Promise<void> | null = null

  const allProjects = computed(() => projects.value)
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

    const project = normalizeProject(updatedProject)
    project.isExists = await checkProjectExistence(project)
    projects.value[index] = project

    await saveProjects()
    return true
  }

  async function removeProject(appendTime: LocalProject['appendTime']) {
    const index = projects.value.findIndex(project => project.appendTime === appendTime)
    if (index === -1)
      return false

    projects.value.splice(index, 1)
    await saveProjects()
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

  function clearProjects() {
    projects.value.splice(0, projects.value.length)
  }

  async function saveProjects() {
    try {
      await projectsPersistence.save(projects.value)
    }
    catch (error) {
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
    catch (error) {
      console.error('Error loading project data:', error)
      loaded.value = true
    }
  }

  function checkPathExistenceInProjects(
    path: LocalProject['path'],
    excludedPaths: LocalProject['path'][] = [],
  ) {
    const targetPath = normalizePathForCompare(path)
    const excluded = new Set(excludedPaths.map(normalizePathForCompare))
    return projects.value.some((project) => {
      const projectPath = normalizePathForCompare(project.path)
      return projectPath === targetPath && !excluded.has(projectPath)
    })
  }

  async function checkProjectExistence(project: LocalProject): Promise<boolean> {
    const { exists } = await window.api.checkPathExistence(project.path)
    return exists
  }

  async function refreshProjectExistence() {
    await Promise.all(
      projects.value.map(async (project) => {
        project.isExists = await checkProjectExistence(project)
      }),
    )
  }

  async function moveProjectToTopByTime(appendTime: LocalProject['appendTime']) {
    const index = projects.value.findIndex(project => project.appendTime === appendTime)
    if (index <= 0) {
      return
    }

    const [item] = projects.value.splice(index, 1)
    projects.value.unshift(item)
    void saveProjects()
  }

  return {
    projects,
    loaded,
    allProjects,
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
    clearProjects,
    saveProjects,
    loadProjects,
    checkPathExistenceInProjects,
    checkProjectExistence,
    refreshProjectExistence,
    moveProjectToTopByTime,
  }
})
