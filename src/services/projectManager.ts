import { reactive } from 'vue'

import type { LocalProject, ProjectKind, ProjectLanguage } from '~/constants/localProject'

class ProjectManager {
  private projectItems = reactive<LocalProject[]>([])

  constructor() {
    this.loadProjects().then()
  }

  // 添加项目到列表头部
  async addProject(newProject: LocalProject): Promise<void> {
    this.projectItems.unshift(newProject)
    await this.checkProjectExistence(newProject)
    await this.saveProjects()
  }

  // 获取所有项目
  getProjects(): LocalProject[] {
    return this.projectItems
  }

  // 获取指定时间的项目
  getProjectByAppendTime(appendTime: number): LocalProject | undefined {
    return this.projectItems.find(project => project.appendTime === appendTime)
  }

  // 获取指定类型的项目
  getProjectsByKind(kind: ProjectKind): LocalProject[] {
    return this.projectItems.filter(project => project.kind === kind)
  }

  // 获取指定语言的项目
  getProjectsByLang(lang: ProjectLanguage): LocalProject[] {
    return this.projectItems.filter(project => project.mainLang === lang)
  }

  // 获取临时项目
  getTempProjects(): LocalProject[] {
    return this.projectItems.filter(project => project.isTemporary)
  }

  // 获取主要语言的统计信息
  getMainLangSummary(): { text: ProjectLanguage, color: `#${string}`, count: number }[] {
    // 创建一个 Map 来统计语言及其信息
    const langMap = new Map<ProjectLanguage, { color: `#${string}`, count: number }>()

    for (const project of this.projectItems) {
      const lang = project.mainLang
      const color = project.mainLangColor ?? '#ccc' // 如果没有定义颜色，则使用默认颜色

      if (langMap.has(lang)) {
        // 如果语言已存在于 Map 中，则更新计数
        langMap.get(lang)!.count += 1
      }
      else {
        // 如果语言不存在于 Map 中，则添加初始信息
        langMap.set(lang, { color, count: 1 })
      }
    }

    // 将 Map 转换为数组形式并返回
    return Array.from(langMap.entries()).map(([text, { color, count }]) => ({
      text,
      color,
      count,
    }))
  }

  // 更新项目
  async updateProject(appendTime: number, updatedProject: LocalProject): Promise<boolean> {
    // 根据 appendTime 查找项目的索引
    const index = this.projectItems.findIndex(project => project.appendTime === appendTime)

    // 如果找到对应的项目，更新它
    if (index !== -1) {
      const project = this.projectItems[index]

      // 更新项目的字段，保留原有的字段
      Object.assign(project, updatedProject)

      await this.checkProjectExistence(project)

      // 保存项目列表
      await this.saveProjects()

      return true
    }

    // 如果没有找到对应的项目，返回 false
    return false
  }

  // 根据索引移除项目
  async removeProject(appendTime: number): Promise<boolean> {
    const index = this.projectItems.findIndex(project => project.appendTime === appendTime)

    if (index !== -1) {
      this.projectItems.splice(index, 1)

      // 保存项目列表
      await this.saveProjects()

      return true
    }
    return false
  }

  // 清空项目列表
  clearProjects(): void {
    this.projectItems.splice(0, this.projectItems.length)
  }

  // 保存项目列表到本地文件
  async saveProjects(): Promise<void> {
    try {
      const dataToSave = JSON.stringify(this.projectItems, (key, value) => {
        if (key === 'group' && value === '')
          return undefined // 当 group 为空时不保存

        if (key === 'langGroup' || key === 'isExists')
          return undefined // 不保存 langGroup 和 exists

        if (key === 'isTemporary' && value !== true)
          return undefined // 仅当 isTemporary 为 true 时保存

        if (key === 'license' && value === 'None')
          return undefined // 当 license 为 None 时不保存

        return value
      })
      await window.api.saveProjectData(dataToSave)
    }
    catch (error: any) {
      console.error('Error saving project data:', error)
    }
  }

  // 从本地文件加载项目列表
  async loadProjects(): Promise<void> {
    try {
      const result = await window.api.loadProjectData()
      if (result.success && result.data) {
        const loadedProjects = JSON.parse(result.data)

        // 更新项目列表
        this.projectItems.splice(0, this.projectItems.length, ...loadedProjects)

        for (const project of this.projectItems) {
          // 补充 group 字段
          project.group = project.group || ''
          // 如果 isTemporary 不存在，则设置为 false
          project.isTemporary = !!project.isTemporary

          // 补充exists字段
          this.checkProjectExistence(project)
        }
      }
    }
    catch (error: any) {
      console.error('Error loading project data:', error)
    }
  }

  // 检查路径是否存在项目列表中
  checkPathExistenceInProjects(path: string, excludedPaths: string[] = []): boolean {
    return this.projectItems.some(
      project => project.path === path && !excludedPaths.includes(project.path),
    )
  }

  // 检查项目是否存在
  async checkProjectExistence(project: LocalProject): Promise<boolean> {
    const { exists } = await window.api.checkPathExistence(project.path)
    project.isExists = exists
    return exists
  }
}

export const projectManager = new ProjectManager()
