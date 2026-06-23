import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

export const GITHUB_REPOSITORY_RE = /github\.com[/:]([^/:\s]+\/[^/\s#.]+)/

export function extractGithubRepositoryName(url: string) {
  return url.match(GITHUB_REPOSITORY_RE)?.[1]?.replace(/\.git$/, '') || ''
}

export function normalizeProjectSourceExternalUrl(url: string) {
  const githubName = extractGithubRepositoryName(url)
  if (githubName)
    return `https://github.com/${githubName}`

  if (/^https?:\/\//i.test(url))
    return url

  return `https://${url}`
}

export function sourceNameFromUrl(url: string) {
  const githubName = extractGithubRepositoryName(url)
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
