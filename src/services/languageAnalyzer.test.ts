import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { LinguistLanguageResult, LinguistResult } from '~/types/linguist'

import { LanguageAnalyzer } from './languageAnalyzer'

const emptyLines = { code: 0, content: 0, total: 0 }

function language(bytes: number, type: LinguistLanguageResult['type'], color?: `#${string}`): LinguistLanguageResult {
  return {
    bytes,
    color,
    lines: emptyLines,
    type,
  }
}

function analysis(results: Record<string, LinguistLanguageResult>, mainLanguageOverride?: string): LinguistResult {
  return {
    files: {
      alternatives: {},
      bytes: 0,
      count: 0,
      lines: emptyLines,
      results: {},
    },
    languages: {
      bytes: Object.values(results).reduce((sum, item) => sum + item.bytes, 0),
      count: Object.keys(results).length,
      lines: emptyLines,
      results,
    },
    mainLanguageOverride,
    unknown: {
      bytes: 0,
      count: 0,
      extensions: {},
      filenames: {},
      lines: emptyLines,
    },
  }
}

describe('languageAnalyzer', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      api: {
        analyzeProject: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('prefers programming languages before larger markup or data results', async () => {
    vi.mocked(window.api.analyzeProject).mockResolvedValue(analysis({
      HTML: language(900, 'markup', '#e34c26'),
      JSON: language(800, 'data', '#292929'),
      TypeScript: language(300, 'programming', '#3178c6'),
    }))

    const analyzer = new LanguageAnalyzer('E:\\Projects\\CodeNest')

    await expect(analyzer.analyze()).resolves.toBe(true)
    expect(analyzer.mainLang).toBe('TypeScript')
    expect(analyzer.mainLangColor).toBe('#3178c6')
    expect(analyzer.langGroup?.map(item => item.text)).toEqual(['TypeScript', 'HTML', 'JSON'])
  })

  it('uses a project-wide language override when no language results are returned', async () => {
    vi.mocked(window.api.analyzeProject).mockResolvedValue(analysis({}, 'Vue'))

    const analyzer = new LanguageAnalyzer('E:\\Projects\\CodeNest')

    await expect(analyzer.analyze()).resolves.toBe(true)
    expect(analyzer.mainLang).toBe('Vue')
    expect(analyzer.mainLangColor).toBeNull()
    expect(analyzer.langGroup).toBeNull()
  })

  it('groups tiny language percentages into Other and normalizes to 100%', async () => {
    vi.mocked(window.api.analyzeProject).mockResolvedValue(analysis({
      CSS: language(2, 'markup', '#563d7c'),
      Rust: language(998, 'programming', '#dea584'),
    }))

    const analyzer = new LanguageAnalyzer('E:\\Projects\\CodeNest')

    await expect(analyzer.analyze()).resolves.toBe(true)
    expect(analyzer.langGroup).toEqual([
      { color: '#dea584', percentage: 99.8, text: 'Rust' },
      { color: '#ccc', percentage: 0.2, text: 'Other' },
    ])
    expect(analyzer.langGroup?.reduce((sum, item) => sum + item.percentage, 0)).toBe(100)
  })

  it('resets state when analysis fails', async () => {
    vi.mocked(window.api.analyzeProject).mockRejectedValue(new Error('analysis failed'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const analyzer = new LanguageAnalyzer('E:\\Projects\\CodeNest')
    analyzer.mainLang = 'TypeScript'
    analyzer.mainLangColor = '#3178c6'
    analyzer.langGroup = [{ color: '#3178c6', percentage: 100, text: 'TypeScript' }]

    await expect(analyzer.analyze()).resolves.toBe(false)
    expect(analyzer.mainLang).toBeNull()
    expect(analyzer.mainLangColor).toBeNull()
    expect(analyzer.langGroup).toBeNull()
  })
})
