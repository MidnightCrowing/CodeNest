export interface Files {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  results: Record<string, string | null>
  alternatives: Record<string, (string | null)[]>
}

export interface LanguageResult {
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

export interface Languages {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  results: Record<string, LanguageResult>
}

export interface Unknown {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  extensions: Record<string, number>
  filenames: Record<string, number>
}

export interface LinguistResult {
  files: Files
  languages: Languages
  unknown: Unknown
}
