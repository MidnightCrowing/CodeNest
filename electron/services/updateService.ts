import { app } from 'electron'

interface CheckUpdateResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  url?: string
  name?: string
  notes?: string
  publishedAt?: string
  error?: string
}

function normalizeVersion(v: string | undefined): string {
  if (!v) {
    return '0.0.0'
  }
  // remove leading v/V and trim whitespace
  const cleaned = v.trim().replace(/^v/i, '')
  // drop pre-release/build metadata for comparison
  return cleaned.split(/[+-]/)[0]
}

function compareSemver(a: string, b: string): number {
  const pa = normalizeVersion(a).split('.').map(n => Number.parseInt(n, 10) || 0)
  const pb = normalizeVersion(b).split('.').map(n => Number.parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb)
      return 1
    if (na < nb)
      return -1
  }
  return 0
}

export async function checkUpdate(): Promise<CheckUpdateResult> {
  try {
    // robust version source for dev and packaged
    const currentVersion = app.getVersion() || '0.0.0'

    // GitHub Releases API: latest (excludes drafts and prereleases)
    const res = await fetch('https://api.github.com/repos/MidnightCrowing/CodeNest/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'CodeNest (Electron)',
      },
    })

    if (!res.ok) {
      // e.g. rate limited or not found
      return { hasUpdate: false, currentVersion, error: `Request failed: ${res.status}` }
    }

    const json: any = await res.json()
    const latestTag = json?.tag_name as string | undefined
    const latestVersion = normalizeVersion(latestTag || json?.name)
    const url: string | undefined = json?.html_url || 'https://github.com/MidnightCrowing/CodeNest/releases/latest'
    const name: string | undefined = json?.name
    const notes: string | undefined = json?.body
    const publishedAt: string | undefined = json?.published_at

    const cmp = compareSemver(currentVersion, latestVersion)
    const hasUpdate = cmp < 0

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      url,
      name,
      notes,
      publishedAt,
    }
  }
  catch (e: any) {
    const currentVersion = app.getVersion() || '0.0.0'
    return { hasUpdate: false, currentVersion, error: e?.message || String(e) }
  }
}
