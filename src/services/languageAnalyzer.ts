import type { languagesGroupItem } from '~/constants/localProject'
import type { LinguistLanguageResult } from '~/types/linguist'

/**
 * 用于分析项目语言的工具类
 */
export class LanguageAnalyzer {
  private readonly folderPath: string // 项目路径
  public mainLang: string | null = null // 主要编程语言
  public mainLangColor: `#${string}` | null = null // 主要编程语言的颜色
  public langGroup: languagesGroupItem[] | null = null // 语言分组，用于展示比例

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
      this.mainLangColor = this.mainLang ? sortedResults[this.mainLang].color ?? null : null

      // 转换为语言分组格式
      this.langGroup = this.convertToLangGroup(sortedResults)

      return true
    }
    catch (error: unknown) {
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
    const res = await window.api.analyzeProject(this.folderPath)
    if (!res || 'error' in res || !res.languages)
      return {}
    return res.languages.results
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
      color: (info.color ?? '#ccc') as `#${string}`,
      percentage: Number.parseFloat(((info.bytes / totalBytes) * 100).toFixed(2)),
    }))

    // 将小于 0.5% 的项合并到 `other`
    const otherLanguages = languages.filter(lang => lang.percentage < 0.5)
    const significantLanguages = languages.filter(lang => lang.percentage >= 0.5)

    const grouped = [...significantLanguages]
    if (otherLanguages.length > 0) {
      grouped.push({
        text: 'Other',
        color: '#ccc',
        percentage: otherLanguages.reduce((sum, lang) => sum + lang.percentage, 0),
      })
    }

    // 归一化到精确 100%: 最后一项补偿舍入误差
    if (grouped.length > 0) {
      const sumExceptLast = grouped.slice(0, -1).reduce((sum, lang) => sum + lang.percentage, 0)
      grouped[grouped.length - 1].percentage = Number.parseFloat((100 - sumExceptLast).toFixed(2))
    }

    return grouped
  }

  /**
   * 重置所有分析结果
   */
  private reset(): void {
    this.mainLang = null
    this.mainLangColor = null
    this.langGroup = null
  }
}
