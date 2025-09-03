// Linguist API types
export interface LinguistFiles {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  results: Record<string, string | null>
  alternatives: Record<string, (string | null)[]>
}

export interface LinguistLanguageResult {
  bytes: number
  lines: {
    total: number
    content: number
    code: number
  }
  type: 'data' | 'markup' | 'programming' | 'prose'
  parent?: string
  color?: `#${string}`
}

export interface LinguistLanguages {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  results: Record<string, LinguistLanguageResult>
}

export interface LinguistUnknown {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  extensions: Record<string, number>
  filenames: Record<string, number>
}

export interface LinguistResult {
  files: LinguistFiles
  languages: LinguistLanguages
  unknown: LinguistUnknown
}
