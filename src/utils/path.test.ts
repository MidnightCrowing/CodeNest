import { afterEach, describe, expect, it, vi } from 'vitest'

import { normalizePathKey, stripWindowsVerbatimPrefix } from './path'

describe('path utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('strips Windows verbatim prefixes', () => {
    expect(stripWindowsVerbatimPrefix('\\\\?\\E:\\Projects\\CodeNest')).toBe('E:\\Projects\\CodeNest')
    expect(stripWindowsVerbatimPrefix('\\\\?\\UNC\\server\\share\\CodeNest')).toBe('\\\\server\\share\\CodeNest')
  })

  it('normalizes Windows paths for comparison', () => {
    vi.stubGlobal('navigator', {
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })

    expect(normalizePathKey(' \\\\?\\E:\\Projects\\CodeNest\\\\ ')).toBe('e:/projects/codenest')
    expect(normalizePathKey('E:/Projects/CodeNest///')).toBe('e:/projects/codenest')
  })
})
