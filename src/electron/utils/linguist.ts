import linguist from 'linguist-js'

interface Files {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  results: Record<string, string | null>
  alternatives: Record<string, (string | null)[]>
}

interface Languages {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  results: Record<string, {
    bytes: number
    lines: {
      total: number
      content: number
      code: number
    }
    type: 'data' | 'markup' | 'programming' | 'prose'
    parent?: string
    color?: `#${string}`
  }>
}

interface Unknown {
  count: number
  bytes: number
  lines: { total: number, content: number, code: number }
  extensions: Record<string, number>
  filenames: Record<string, number>
}

interface LinguistResult {
  files: Files
  languages: Languages
  unknown: Unknown
}

export async function analyzeFolder(folderPath: string): Promise<LinguistResult> {
  // Analyse folder on disc
  const options = { keepVendored: false, quick: false, json: true }

  // Annotate the response of linguist function
  const { files, languages, unknown }: LinguistResult = await linguist(folderPath, options)

  return { files, languages, unknown }
}
