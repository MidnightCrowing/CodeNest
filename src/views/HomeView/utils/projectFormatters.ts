import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

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
