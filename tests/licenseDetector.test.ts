import { describe, expect, it } from 'vitest'

import { LicenseEnum } from '~/constants/license'
import { detectLicenseBySnippet } from '~/services/licenseDetector'

describe('detectLicenseBySnippet', () => {
  it('returns no license for empty input', () => {
    expect(detectLicenseBySnippet(null)).toEqual({
      license: null,
      score: 0,
      matchedPatterns: [],
    })
  })

  it('detects MIT license snippets', () => {
    const result = detectLicenseBySnippet(`
      Permission is hereby granted, free of charge, to any person obtaining a copy
      without restriction, including without limitation the rights to use, copy, modify
    `)

    expect(result.license).toBe(LicenseEnum.MIT)
    expect(result.score).toBeGreaterThan(0)
  })

  it('detects Apache 2.0 license snippets', () => {
    const result = detectLicenseBySnippet(`
      Licensed under the Apache License, Version 2.0
      http://www.apache.org/licenses/LICENSE-2.0
    `)

    expect(result.license).toBe(LicenseEnum.APACHE_2_0)
    expect(result.score).toBeGreaterThan(0)
  })

  it('ignores unrelated text', () => {
    const result = detectLicenseBySnippet('This project is internal documentation without a license notice.')

    expect(result.license).toBeNull()
    expect(result.score).toBe(0)
  })
})
