import { reactive } from 'vue'

import type { LocalProject } from '~/constants/localProject'

class ProjectManager {
  private projectItems = reactive<LocalProject[]>([])

  constructor() {
    this.loadProjects().then()
  }

  // 添加项目到列表头部
  async addProject(newProject: LocalProject): Promise<void> {
    this.projectItems.unshift(newProject)
    await this.saveProjects()
  }

  // 获取所有项目
  getProjects(): LocalProject[] {
    return this.projectItems
  }

  // 根据索引移除项目
  removeProject(index: number): boolean {
    if (index >= 0 && index < this.projectItems.length) {
      this.projectItems.splice(index, 1)
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
      await window.api.saveProjectData(JSON.stringify(this.projectItems))
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
        this.projectItems.splice(0, this.projectItems.length, ...loadedProjects)
      }
    }
    catch (error: any) {
      console.error('Error loading project data:', error)
    }
  }
}

export const projectManager = new ProjectManager()
