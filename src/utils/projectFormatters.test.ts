import { describe, expect, it } from 'vitest'

import { LicenseEnum } from '~/constants/license'
import { ProjectKind } from '~/constants/localProject'

import { formatProjectLanguage, kindLabel, shortLicense } from './projectFormatters'

const t = (key: string) => `translated:${key}`

describe('projectFormatters', () => {
  it('formats project kind labels through i18n keys', () => {
    expect(kindLabel(ProjectKind.MINE, t)).toBe('translated:app.project_kind.mine')
    expect(kindLabel(ProjectKind.FORK, t)).toBe('translated:app.project_kind.fork')
    expect(kindLabel(ProjectKind.CLONE, t)).toBe('translated:app.project_kind.clone')
  })

  it('uses compact license labels', () => {
    expect(shortLicense(null, t)).toBe('translated:app.license.none')
    expect(shortLicense(LicenseEnum.MIT, t)).toBe('MIT')
    expect(shortLicense(LicenseEnum.APACHE_2_0, t)).toBe('Apache-2.0')
    expect(shortLicense(LicenseEnum.GPLV3, t)).toBe('GPL-3.0')
    expect(shortLicense(LicenseEnum.BSD_3_CLAUSE, t)).toBe('BSD 3-Clause "New" or "Revised"')
  })

  it('normalizes empty and unknown language labels', () => {
    expect(formatProjectLanguage('', t)).toBe('translated:app.common.unknown')
    expect(formatProjectLanguage(' unknown ', t)).toBe('translated:app.common.unknown')
    expect(formatProjectLanguage('unknow', t)).toBe('translated:app.common.unknown')
    expect(formatProjectLanguage('Other', t)).toBe('translated:language_pop.other')
    expect(formatProjectLanguage('TypeScript', t)).toBe('TypeScript')
  })
})
