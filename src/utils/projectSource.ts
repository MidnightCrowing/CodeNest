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
