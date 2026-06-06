import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KEY_LINE_RE = /^(\s*)([\w-]+):(?:\s|$)/

function collectLocaleKeys(raw: string): string[] {
  const stack: string[] = []
  const keys: string[] = []

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#'))
      continue

    const match = line.match(KEY_LINE_RE)
    if (!match)
      continue

    const level = Math.floor(match[1].length / 2)
    stack.splice(level)
    stack[level] = match[2]
    keys.push(stack.slice(0, level + 1).join('.'))
  }

  const parentKeys = new Set(keys.flatMap((key) => {
    const parts = key.split('.')
    return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('.'))
  }))

  return keys.filter(key => !parentKeys.has(key)).sort()
}

function readLocaleKeys(filename: string) {
  const raw = fs.readFileSync(path.resolve(filename), 'utf8')
  return collectLocaleKeys(raw)
}

describe('locale keys', () => {
  it('keeps English and Simplified Chinese locale keys in sync', () => {
    expect(readLocaleKeys('src/locales/zh-CN.yml')).toEqual(readLocaleKeys('src/locales/en.yml'))
  })
})
