// Replaces the api.github.com asset URLs that tauri-action writes for draft releases
// with the public release download URLs. The API form is subject to the unauthenticated
// 60 requests/hour limit, which surfaces in the app as "Download request failed with
// status: 403 Forbidden".
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import process from 'node:process'

const repo = process.env.REPO
const tag = process.env.TAG

if (!repo || !tag) {
  console.error('REPO and TAG environment variables are required')
  process.exit(1)
}

function gh(args, encoding = 'utf8') {
  return execFileSync('gh', args, { encoding, maxBuffer: 64 * 1024 * 1024 })
}

const releases = JSON.parse(gh(['api', `repos/${repo}/releases?per_page=100`]))
const release = releases.find(item => item.tag_name === tag)
if (!release) {
  console.error(`Release for tag ${tag} not found`)
  process.exit(1)
}

const assetNameById = new Map(release.assets.map(asset => [String(asset.id), asset.name]))
const manifestAsset = release.assets.find(asset => asset.name === 'latest.json')
if (!manifestAsset) {
  console.error(`Release ${tag} has no latest.json asset`)
  process.exit(1)
}

const raw = gh(
  ['api', `repos/${repo}/releases/assets/${manifestAsset.id}`, '-H', 'Accept: application/octet-stream'],
  'buffer',
)
const manifest = JSON.parse(Buffer.from(raw).toString('utf8'))

const unresolved = []
for (const [platform, entry] of Object.entries(manifest.platforms ?? {})) {
  const assetId = /\/releases\/assets\/(\d+)/.exec(entry.url ?? '')?.[1]
  if (!assetId)
    continue

  const name = assetNameById.get(assetId)
  if (!name) {
    unresolved.push(`${platform} (asset ${assetId})`)
    continue
  }

  entry.url = `https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`
  console.log(`${platform} -> ${entry.url}`)
}

if (unresolved.length > 0) {
  console.error(`Could not resolve asset names for: ${unresolved.join(', ')}`)
  process.exit(1)
}

fs.writeFileSync('latest.json', `${JSON.stringify(manifest, null, 2)}\n`)
gh(['release', 'upload', tag, 'latest.json', '--clobber', '--repo', repo])
console.log(`\nUpdated latest.json for ${tag}.`)
