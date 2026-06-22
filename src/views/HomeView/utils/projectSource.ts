import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { GITHUB_SOURCE_RE } from '../constants'

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

  const githubName = sourceUrl.match(GITHUB_SOURCE_RE)?.[1]
  if (githubName)
    return `https://github.com/${githubName.replace(/\.git$/, '')}`

  if (/^https?:\/\//i.test(sourceUrl))
    return sourceUrl

  return `https://${sourceUrl}`
}

export function sourceNameFromUrl(url: string) {
  const githubName = url.match(GITHUB_SOURCE_RE)?.[1]
  if (githubName)
    return githubName

  try {
    const parsedUrl = new URL(url)
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
    return pathParts.length >= 2
      ? pathParts.slice(-2).join('/')
      : parsedUrl.hostname
  }
  catch {
    return url
  }
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
