import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import {
  normalizeProjectSourceExternalUrl,
  sourceNameFromUrl,
} from '~/utils/projectSource'

export function isSourceProject(project: LocalProject) {
  return project.kind === ProjectKind.FORK || project.kind === ProjectKind.CLONE
}

export function projectSourceUrl(project: LocalProject) {
  return isSourceProject(project) ? project.fromUrl?.trim() || '' : ''
}

export function projectSourceExternalUrl(project: LocalProject) {
  const sourceUrl = projectSourceUrl(project)
  if (!sourceUrl)
    return ''

  return normalizeProjectSourceExternalUrl(sourceUrl)
}

export function projectSourceName(project: LocalProject) {
  const sourceUrl = projectSourceUrl(project)
  return isSourceProject(project)
    ? project.fromName?.trim() || (sourceUrl ? sourceNameFromUrl(sourceUrl) : '')
    : ''
}

export function hasProjectSource(project: LocalProject) {
  return !!projectSourceName(project)
}

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
