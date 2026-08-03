import type { languagesGroupItem } from '~/constants/localProject'
import type { LinguistLanguageResult, LinguistResult } from '~/types/linguist'

/**
 * 封装项目语言分析结果：主语言、配色、占比分组。
 */
export class LanguageAnalyzer {
  private readonly folderPath: string
  public mainLang: string | null = null
  public mainLangColor: `#${string}` | null = null
  public langGroup: languagesGroupItem[] | null = null

  constructor(folderPath: string) {
    this.folderPath = folderPath
  }

  async analyze(): Promise<boolean> {
    try {
      const analysis = await this.getAnalysisResult()
      const results = analysis?.languages.results || {}
      const mainLanguageOverride = analysis?.mainLanguageOverride?.trim()

      if (!results || Object.keys(results).length === 0) {
        if (mainLanguageOverride) {
          this.mainLang = mainLanguageOverride
          this.mainLangColor = null
          this.langGroup = null
          return true
        }

        this.reset()
        return false
      }

      const sortedResults = this.sortByMainProgrammingLanguage(results)

      this.mainLang = Object.keys(sortedResults)[0] || null
      this.mainLangColor = this.mainLang ? sortedResults[this.mainLang].color ?? null : null
      this.langGroup = this.convertToLangGroup(sortedResults)

      return true
    }
    catch (error: unknown) {
      console.warn('LanguageAnalyzer analyze failed:', error)
      this.reset()
      return false
    }
  }

  private async getAnalysisResult(): Promise<LinguistResult | null> {
    const res = await window.api.analyzeProject(this.folderPath)
    if (!res || 'error' in res || !res.languages)
      return null
    return res
  }

  private sortByMainProgrammingLanguage(results: Record<string, LinguistLanguageResult>): Record<string, LinguistLanguageResult> {
    const typePriority = { programming: 1, markup: 2, data: 3, prose: 4 }

    return Object.fromEntries(
      Object.entries(results).sort(([keyA, valueA], [keyB, valueB]) => {
        const priorityA = typePriority[valueA.type] || 5
        const priorityB = typePriority[valueB.type] || 5
        if (priorityA !== priorityB)
          return priorityA - priorityB

        if (valueA.bytes !== valueB.bytes)
          return valueB.bytes - valueA.bytes

        return keyA.localeCompare(keyB)
      }),
    )
  }

  private convertToLangGroup(sortedResults: Record<string, LinguistLanguageResult>): languagesGroupItem[] | null {
    if (!sortedResults || Object.keys(sortedResults).length === 0)
      return null

    const totalBytes = Object.values(sortedResults).reduce((sum, lang) => sum + lang.bytes, 0)

    const languages = Object.entries(sortedResults).map(([lang, info]) => ({
      text: lang,
      color: (info.color ?? '#ccc') as `#${string}`,
      percentage: Number.parseFloat(((info.bytes / totalBytes) * 100).toFixed(2)),
    }))

    // 占比过小的语言合并为 Other，避免图例被噪声项撑满
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

    // 最后一项补偿 toFixed 舍入误差，保证合计精确 100%
    if (grouped.length > 0) {
      const sumExceptLast = grouped.slice(0, -1).reduce((sum, lang) => sum + lang.percentage, 0)
      grouped[grouped.length - 1].percentage = Number.parseFloat((100 - sumExceptLast).toFixed(2))
    }

    return grouped
  }

  private reset(): void {
    this.mainLang = null
    this.mainLangColor = null
    this.langGroup = null
  }
}
