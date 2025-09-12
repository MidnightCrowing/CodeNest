import type { LicenseEnum } from '~/constants/license'
import { LicenseInfo } from '~/constants/license'

export interface LicenseDetectResult {
  license: LicenseEnum | null
  score: number
  matchedPatterns: string[]
}

/**
 * 根据传入的 license 文本片段尝试识别许可证类型。
 * 简单打分策略：一个正则命中 +1，分数最高者为结果；若全为 0，返回 null。
 */
export function detectLicenseBySnippet(snippet: string | undefined | null): LicenseDetectResult {
  if (!snippet || typeof snippet !== 'string')
    return { license: null, score: 0, matchedPatterns: [] }

  const text = snippet.toLowerCase()
  let best: LicenseDetectResult = { license: null, score: 0, matchedPatterns: [] }

  for (const [key, meta] of Object.entries(LicenseInfo) as Array<[keyof typeof LicenseInfo, typeof LicenseInfo[keyof typeof LicenseInfo]]>) {
    const detect = meta.detect
    if (!detect || !detect.patterns?.length)
      continue

    let score = 0
    const matched: string[] = []
    for (const reg of detect.patterns) {
      if (reg.test(text)) {
        score += 1
        matched.push(String(reg))
      }
    }

    if (score > best.score) {
      best = { license: key as unknown as LicenseEnum, score, matchedPatterns: matched }
    }
  }

  return best
}
