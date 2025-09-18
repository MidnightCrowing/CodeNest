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
      if (key === 'license' && value === 'None')
        return undefined
      return value
    }),
})

export const useProjectsStore = defineStore('projects', () => {
  // -------------------------
  // State
  // -------------------------
  const projects = ref<LocalProject[]>([])

  // -------------------------
  // Getters
  // -------------------------

  // 所有项目
  const allProjects = computed(() => projects.value)

  // 临时项目
  const tempProjects = computed(() =>
    projects.value.filter(project => project.isTemporary),
  )

  // 主要语言统计信息
  const mainLangSummary = computed(() => {
    const langMap = new Map<ProjectLanguage, { color: `#${string}`, count: number }>()

    for (const project of projects.value) {
      const lang = project.mainLang
      const color = project.mainLangColor ?? '#ccc'

      if (langMap.has(lang)) {
        langMap.get(lang)!.count += 1
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

  // 所有组别
  const allGroups = computed(() => {
    const groupSet = new Set<string>()
    for (const project of projects.value) {
      if (project.group && project.group.trim() !== '') {
        groupSet.add(project.group)
      }
    }
    return Array.from(groupSet).sort((a, b) => a.localeCompare(b))
  })

  // -------------------------
  // Actions
  // -------------------------

  // 添加项目到列表头部
  async function addProject(newProject: LocalProject, save?: boolean) {
    projects.value.unshift(newProject)
    newProject.isExists = await checkProjectExistence(newProject)
    if (save) {
      await saveProjects()
    }
  }

  // 根据 appendTime 获取项目
  function getProjectByAppendTime(appendTime: LocalProject['appendTime']) {
    return projects.value.find(project => project.appendTime === appendTime)
  }

  // 根据类型获取项目
  function getProjectsByKind(kind: ProjectKind) {
    return projects.value.filter(project => project.kind === kind)
  }

  // 根据语言获取项目
  function getProjectsByLang(lang: ProjectLanguage) {
    return projects.value.filter(project => project.mainLang === lang)
  }

  // 更新项目
  async function updateProject(
    appendTime: LocalProject['appendTime'],
    updatedProject: LocalProject,
  ) {
    const index = projects.value.findIndex(p => p.appendTime === appendTime)
    if (index === -1) {
      return false
    }

    Object.assign(projects.value[index], updatedProject)

    const project = projects.value[index]
    project.isExists = await checkProjectExistence(project)

    await saveProjects()
    return true
  }

  // 移除项目
  async function removeProject(appendTime: LocalProject['appendTime']) {
    const index = projects.value.findIndex(p => p.appendTime === appendTime)
    if (index === -1)
      return false

    projects.value.splice(index, 1)
    await saveProjects()
    return true
  }

  // 清空项目
  function clearProjects() {
    projects.value.splice(0, projects.value.length)
  }

  // 保存项目到本地
  async function saveProjects() {
    try {
      await projectsPersistence.save(projects.value)
    }
    catch (error) {
      console.error('Error saving project data:', error)
    }
  }

  // 从本地加载项目
  async function loadProjects() {
    try {
      const loaded = await projectsPersistence.load()
      if (loaded) {
        for (const project of loaded) {
          project.group = project.group || ''
          project.isTemporary = !!project.isTemporary
          project.isExists = await checkProjectExistence(project)
        }
        projects.value.splice(0, projects.value.length, ...loaded)
      }
    }
    catch (error) {
      console.error('Error loading project data:', error)
    }
  }

  // 检查路径是否存在于项目中
  function checkPathExistenceInProjects(
    path: LocalProject['path'],
    excludedPaths: LocalProject['path'][] = [],
  ) {
    return projects.value.some(p => p.path === path && !excludedPaths.includes(p.path))
  }

  // 检查单个项目是否存在
  async function checkProjectExistence(project: LocalProject): Promise<boolean> {
    const { exists } = await window.api.checkPathExistence(project.path)
    return exists
  }

  // 将项目移动到顶部
  async function moveProjectToTopByTime(appendTime: LocalProject['appendTime']) {
    const index = projects.value.findIndex(p => p.appendTime === appendTime)
    if (index <= 0) {
      return
    }
    const [item] = projects.value.splice(index, 1)
    projects.value.unshift(item)
    // 异步持久化顺序变化
    void saveProjects()
  }

  // -------------------------
  // Expose
  // -------------------------
  return {
    // state
    projects,

    // getters
    allProjects,
    tempProjects,
    mainLangSummary,
    allGroups,

    // actions
    addProject,
    getProjectByAppendTime,
    getProjectsByKind,
    getProjectsByLang,
    updateProject,
    removeProject,
    clearProjects,
    saveProjects,
    loadProjects,
    checkPathExistenceInProjects,
    checkProjectExistence,
    moveProjectToTopByTime,
  }
})
