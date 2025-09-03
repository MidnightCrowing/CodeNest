import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { LocalProject, ProjectKind, ProjectLanguage } from '~/constants/localProject'

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

  // -------------------------
  // Actions
  // -------------------------

  // 添加项目到列表头部
  async function addProject(newProject: LocalProject) {
    projects.value.unshift(newProject)
    await checkProjectExistence(newProject)
    await saveProjects()
  }

  // 根据 appendTime 获取项目
  function getProjectByAppendTime(appendTime: number) {
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
  async function updateProject(appendTime: number, updatedProject: LocalProject) {
    const index = projects.value.findIndex(p => p.appendTime === appendTime)
    if (index === -1)
      return false

    Object.assign(projects.value[index], updatedProject)

    await checkProjectExistence(projects.value[index])
    await saveProjects()
    return true
  }

  // 移除项目
  async function removeProject(appendTime: number) {
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
      const dataToSave = JSON.stringify(projects.value, (key, value) => {
        if (key === 'group' && value === '')
          return undefined
        if (key === 'langGroup' || key === 'isExists')
          return undefined
        if (key === 'isTemporary' && value !== true)
          return undefined
        if (key === 'license' && value === 'None')
          return undefined
        return value
      })
      await window.api.saveProjectData(dataToSave)
    }
    catch (error) {
      console.error('Error saving project data:', error)
    }
  }

  // 从本地加载项目
  async function loadProjects() {
    try {
      const result = await window.api.loadProjectData()
      if (result.success && result.data) {
        const loadedProjects: LocalProject[] = JSON.parse(result.data)

        projects.value.splice(0, projects.value.length, ...loadedProjects)

        for (const project of projects.value) {
          project.group = project.group || ''
          project.isTemporary = !!project.isTemporary
          checkProjectExistence(project)
        }
      }
    }
    catch (error) {
      console.error('Error loading project data:', error)
    }
  }

  // 检查路径是否存在于项目中
  function checkPathExistenceInProjects(path: string, excludedPaths: string[] = []) {
    return projects.value.some(
      p => p.path === path && !excludedPaths.includes(p.path),
    )
  }

  // 检查单个项目是否存在
  async function checkProjectExistence(project: LocalProject) {
    const { exists } = await window.api.checkPathExistence(project.path)
    project.isExists = exists
    return exists
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
  }
})
