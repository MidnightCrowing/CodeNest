import { LicenseEnum } from '~/constants/license'
import { ProjectKind } from '~/constants/localProject'

type Translate = (key: string) => string

export function kindLabel(kind: ProjectKind, t: Translate) {
  switch (kind) {
    case ProjectKind.FORK:
      return t('app.project_kind.fork')
    case ProjectKind.CLONE:
      return t('app.project_kind.clone')
    case ProjectKind.MINE:
    default:
      return t('app.project_kind.mine')
  }
}

export function shortLicense(license: LicenseEnum | string | null | undefined, t: Translate) {
  if (!license || license === LicenseEnum.NONE)
    return t('app.license.none')
  if (license === LicenseEnum.MIT)
    return 'MIT'
  if (license === LicenseEnum.APACHE_2_0)
    return 'Apache-2.0'
  if (license === LicenseEnum.GPLV3)
    return 'GPL-3.0'
  if (license === LicenseEnum.GPLV2)
    return 'GPL-2.0'
  if (license === LicenseEnum.OTHER)
    return t('app.license.other')
  return String(license).replace(' License', '').replace('GNU ', '')
}

export function formatProjectLanguage(
  language: string | null | undefined,
  t: Translate,
  emptyFallbackKey = 'app.common.unknown',
) {
  const normalized = language?.trim()
  if (!normalized || normalized.toLowerCase() === 'unknown' || normalized.toLowerCase() === 'unknow')
    return t(emptyFallbackKey)
  if (normalized === 'Other')
    return t('language_pop.other')
  return normalized
}
