import { reactive } from 'vue'

import type { LinguistLanguageResult, LinguistResult } from '~/components/ProjectConfig/types'
import type { languagesGroupItem, LocalProject, ProjectKind, ProjectLanguage } from '~/constants/localProject'
import type { JeDropdownOptionGroupProps, JeDropdownOptionProps } from '~/jetv-ui'
import { t } from '~/utils/i18n'

/**
 * 用于分析项目语言的工具类
 */
export class LanguageAnalyzer {
  private readonly folderPath: string // 项目路径
  public mainLang: string | null = null // 主要编程语言
  public mainLangColor: `#${string}` | null = null // 主要编程语言的颜色
  public langGroup: languagesGroupItem[] | null = null // 语言分组，用于展示比例
  public mainLanguageOptions: (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] = [] // 下拉选项列表

  /**
   * 构造函数
   * @param folderPath - 项目的文件路径
   */
  constructor(folderPath: string) {
    this.folderPath = folderPath
  }

  /**
   * 执行分析，生成语言相关的数据
   * @returns {Promise<boolean>} - 分析是否成功
   */
  async analyze(): Promise<boolean> {
    try {
      // 获取语言分析结果
      const results = await this.getLanguagesResult()

      // 如果结果为空，返回 false
      if (!results || Object.keys(results).length === 0) {
        this.reset()
        return false
      }

      // 排序分析结果
      const sortedResults = this.sortByMainProgrammingLanguage(results)

      // 设置主要编程语言及颜色
      this.mainLang = Object.keys(sortedResults)[0] || null
      this.mainLangColor = this.mainLang ? sortedResults[this.mainLang].color as `#${string}` : null

      // 转换为语言分组格式
      this.langGroup = this.convertToLangGroup(sortedResults)

      // 转换为 JeDropdown 下拉选项格式
      this.mainLanguageOptions = this.convertResultsToDropdownOptions(sortedResults)

      return true
    }
    catch (error) {
      console.warn('LanguageAnalyzer analyze failed:', error)
      this.reset()
      return false
    }
  }

  /**
   * 获取项目中的语言分析结果
   * @returns {Promise<Record<string, LinguistLanguageResult>>} - 语言分析结果
   */
  private async getLanguagesResult(): Promise<Record<string, LinguistLanguageResult>> {
    const { languages } = await window.api.analyzeFolder(this.folderPath) as { languages: LinguistResult['languages'] }
    return languages.results
  }

  /**
   * 按主要编程语言优先级对语言结果进行排序
   * @param results - 原始语言分析结果
   * @returns {Record<string, LinguistLanguageResult>} - 排序后的结果
   */
  private sortByMainProgrammingLanguage(results: Record<string, LinguistLanguageResult>): Record<string, LinguistLanguageResult> {
    const typePriority = { programming: 1, markup: 2, data: 3, prose: 4 }

    return Object.fromEntries(
      Object.entries(results).sort(([keyA, valueA], [keyB, valueB]) => {
        // 按类型优先级排序
        const priorityA = typePriority[valueA.type] || 5
        const priorityB = typePriority[valueB.type] || 5
        if (priorityA !== priorityB)
          return priorityA - priorityB

        // 按字节数排序
        if (valueA.bytes !== valueB.bytes)
          return valueB.bytes - valueA.bytes

        // 按语言名排序（字母顺序）
        return keyA.localeCompare(keyB)
      }),
    )
  }

  /**
   * 将语言结果转换为下拉选项格式
   * @param results - 排序后的语言结果
   * @returns {(JeDropdownOptionProps | JeDropdownOptionGroupProps)[]} - 下拉选项
   */
  private convertResultsToDropdownOptions(results: Record<string, LinguistLanguageResult>): (JeDropdownOptionProps | JeDropdownOptionGroupProps)[] {
    return Object.entries(results).map(([key, value]) => ({
      value: key,
      label: key,
      description: t('project_config.lang_info', { type: value.type, bytes: value.bytes, lines: value.lines.total }),
    }))
  }

  /**
   * 将语言结果转换为语言分组格式
   * @param sortedResults - 排序后的语言结果
   * @returns {languagesGroupItem[] | null} - 转换后的语言分组
   */
  private convertToLangGroup(sortedResults: Record<string, LinguistLanguageResult>): languagesGroupItem[] | null {
    if (!sortedResults || Object.keys(sortedResults).length === 0)
      return null

    const totalBytes = Object.values(sortedResults).reduce((sum, lang) => sum + lang.bytes, 0)

    const languages = Object.entries(sortedResults).map(([lang, info]) => ({
      text: lang,
      color: info.color as `#${string}`,
      percentage: Number.parseFloat(((info.bytes / totalBytes) * 100).toFixed(2)),
    }))

    // 将小于 0.5% 的项合并到 `other`
    const otherLanguages = languages.filter(lang => lang.percentage < 0.5)
    const significantLanguages = languages.filter(lang => lang.percentage >= 0.5)

    if (otherLanguages.length > 0) {
      const otherTotalPercentage = otherLanguages.reduce((sum, lang) => sum + lang.percentage, 0)
      significantLanguages.push({
        text: 'Other',
        color: '#ccc', // 可自定义颜色
        percentage: Number.parseFloat(otherTotalPercentage.toFixed(2)),
      } as languagesGroupItem)
    }

    return significantLanguages
  }

  /**
   * 重置所有分析结果
   */
  private reset(): void {
    this.mainLang = null
    this.mainLangColor = null
    this.langGroup = null
    this.mainLanguageOptions = []
  }
}

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

  // 获取指定类型的项目
  getProjectsByKind(kind: ProjectKind): LocalProject[] {
    return this.projectItems.filter(project => project.kind === kind)
  }

  // 获取指定语言的项目
  getProjectsByLang(lang: ProjectLanguage): LocalProject[] {
    return this.projectItems.filter(project => project.mainLang === lang)
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
        if (key === 'langGroup' || key === 'exists')
          return undefined // 不保存 langGroup 和 exists
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
          // 补充exists字段
          window.api.checkPathExistence(project.path).then((res) => {
            project.exists = res.exists
          })
        }
      }
    }
    catch (error: any) {
      console.error('Error loading project data:', error)
    }
  }
}

export const projectManager = new ProjectManager()
