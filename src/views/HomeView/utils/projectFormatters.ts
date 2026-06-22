import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

export function kindLabel(kind: ProjectKind, t: (key: string) => string) {
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

export function kindClass(kind: ProjectKind) {
  switch (kind) {
    case ProjectKind.FORK:
      return 'kind-fork'
    case ProjectKind.CLONE:
      return 'kind-clone'
    case ProjectKind.MINE:
    default:
      return 'kind-mine'
  }
}

export function shortLicense(license: LicenseEnum | undefined, t: (key: string) => string) {
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
  return license.replace(' License', '').replace('GNU ', '')
}

export function editorIconClasses(editor?: CodeEditorEnum | null) {
  if (!editor)
    return []
  const option = codeEditors[editor]
  return ['ide-icon', option?.icon, { 'monochrome-editor-icon': option?.monochromeIcon }]
}

export function editorLabel(editor: CodeEditorEnum, t: (key: string) => string) {
  return codeEditors[editor]?.label || t('app.common.no_editor')
}

export function formatTime(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function formatLastOpened(
  project: LocalProject,
  locale: string,
  t: (key: string) => string,
) {
  return project.lastOpenedAt
    ? formatTime(project.lastOpenedAt, locale)
    : t('app.home.table.never_opened')
}
