import { describe, expect, it } from 'vitest'

import { formatActionError } from './error'

describe('formatActionError', () => {
  it('removes redundant Error prefixes from error messages', () => {
    expect(formatActionError(new Error('Error: failed to open project'))).toBe('failed to open project')
  })

  it('formats non-Error values', () => {
    expect(formatActionError('  Error: command failed  ')).toBe('command failed')
    expect(formatActionError(null)).toBe('null')
  })

  it('falls back for empty messages', () => {
    expect(formatActionError(new Error('   '))).toBe('Unknown error')
    expect(formatActionError('   ')).toBe('Unknown error')
  })
})
