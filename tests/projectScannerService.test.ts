import { describe, expect, it } from 'vitest'

import { checkRegexComplexity, toRegExp } from '~/services/projectScannerService'

describe('checkRegexComplexity', () => {
  it('accepts simple patterns', () => {
    expect(checkRegexComplexity('(demo|test)')).toBe(true)
    expect(checkRegexComplexity('^my-project$')).toBe(true)
    expect(checkRegexComplexity('foo.*bar')).toBe(true)
    expect(checkRegexComplexity('[a-z]+\\d{2,4}')).toBe(true)
  })

  it('rejects nested quantifiers (classic ReDoS)', () => {
    expect(checkRegexComplexity('(a+)+')).toBe(false)
    expect(checkRegexComplexity('(a*)*')).toBe(false)
    expect(checkRegexComplexity('(a+)*')).toBe(false)
  })

  it('rejects consecutive quantifiers', () => {
    expect(checkRegexComplexity('a*+')).toBe(false)
    expect(checkRegexComplexity('a++')).toBe(false)
  })

  it('rejects unbalanced parentheses', () => {
    expect(checkRegexComplexity('(abc')).toBe(false)
    expect(checkRegexComplexity('abc)')).toBe(false)
    expect(checkRegexComplexity('))((')).toBe(false)
  })

  it('rejects excessive nesting depth', () => {
    expect(checkRegexComplexity('((((a))))')).toBe(false)
    expect(checkRegexComplexity('(((a)))')).toBe(true)
  })

  it('handles escaped characters without treating them as syntax', () => {
    expect(checkRegexComplexity('\\(a\\+\\)\\+')).toBe(true)
    expect(checkRegexComplexity('foo\\\\bar')).toBe(true)
  })
})

describe('toRegExp', () => {
  it('parses plain patterns', () => {
    const re = toRegExp('(demo|test)')
    expect(re).toBeInstanceOf(RegExp)
    expect(re!.test('my-demo-app')).toBe(true)
    expect(re!.test('production')).toBe(false)
  })

  it('parses /pattern/flags form and strips g/y flags', () => {
    const re = toRegExp('/demo/gi')
    expect(re).toBeInstanceOf(RegExp)
    expect(re!.flags).toBe('i')
    // 同一实例多次 test() 结果一致(无 lastIndex 状态)
    expect(re!.test('DEMO')).toBe(true)
    expect(re!.test('DEMO')).toBe(true)
  })

  it('returns null for empty or oversized patterns', () => {
    expect(toRegExp('')).toBeNull()
    expect(toRegExp('a'.repeat(201))).toBeNull()
  })

  it('returns null for ReDoS-prone patterns', () => {
    expect(toRegExp('(a+)+b')).toBeNull()
  })

  it('returns null for syntactically invalid patterns', () => {
    expect(toRegExp('[unclosed')).toBeNull()
  })
})
