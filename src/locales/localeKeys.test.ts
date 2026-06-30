import messages from '@intlify/unplugin-vue-i18n/messages'
import { describe, expect, it } from 'vitest'

function collectLocaleKeys(message: unknown, prefix = ''): string[] {
  const keys: string[] = []

  if (message === null || typeof message !== 'object' || Array.isArray(message))
    return prefix ? [prefix] : []

  for (const [key, value] of Object.entries(message)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value))
      keys.push(...collectLocaleKeys(value, path))
    else
      keys.push(path)
  }

  return keys.sort()
}

describe('locale keys', () => {
  it('keeps translated locale keys in sync with English', () => {
    const localeMessages = messages as Record<string, unknown>
    const englishKeys = collectLocaleKeys(localeMessages.en)

    expect(collectLocaleKeys(localeMessages['zh-CN'])).toEqual(englishKeys)
    expect(collectLocaleKeys(localeMessages['zh-TW'])).toEqual(englishKeys)
  })
})
