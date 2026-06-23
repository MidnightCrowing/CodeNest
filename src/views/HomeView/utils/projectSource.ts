import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import {
  projectSourceName,
  projectSourceUrl,
} from '~/utils/projectSource'

export function projectSourcePrefix(project: LocalProject, t: (key: string) => string) {
  return project.kind === ProjectKind.FORK
    ? t('app.home.source.forked_from')
    : t('app.home.source.cloned_from')
}

export function projectSourceTitle(project: LocalProject, t: (key: string) => string) {
  const sourceName = projectSourceName(project)
  const sourceUrl = projectSourceUrl(project)
  const prefix = projectSourcePrefix(project, t)
  if (sourceName && sourceUrl && sourceName !== sourceUrl)
    return `${prefix} ${sourceName}\n${sourceUrl}`
  return sourceName ? `${prefix} ${sourceName}` : sourceUrl
}
