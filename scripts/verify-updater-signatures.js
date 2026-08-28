import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const tauriConfigPath = new URL('../src-tauri/tauri.conf.json', import.meta.url)
const bundleRoot = fileURLToPath(new URL('../src-tauri/target', import.meta.url))

/** Minisign blobs are `sig_alg(2) | key_id(8) | payload`; the key id is printed little-endian. */
function readKeyId(base64Body) {
  const raw = Buffer.from(base64Body, 'base64')
  if (raw.length < 10)
    throw new Error('Malformed minisign blob')
  return Buffer.from(raw.subarray(2, 10)).reverse().toString('hex').toUpperCase()
}

/** Tauri writes `.sig` files as base64 of the minisign file, while `.pub` blobs hold it directly. */
function keyIdFromMinisignFile(content) {
  let text = content.trim()
  if (!text.includes('\n'))
    text = Buffer.from(text, 'base64').toString('utf8').trim()

  const body = text.split('\n')[1]
  if (!body)
    throw new Error('Missing minisign payload line')
  return readKeyId(body.trim())
}

function collectSignatures(dir, found = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  }
  catch {
    return found
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())
      collectSignatures(full, found)
    else if (entry.name.endsWith('.sig'))
      found.push(full)
  }
  return found
}

const config = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'))
const pubkey = config?.plugins?.updater?.pubkey
if (!pubkey) {
  console.error('No updater pubkey configured in src-tauri/tauri.conf.json')
  process.exit(1)
}

const expectedKeyId = keyIdFromMinisignFile(Buffer.from(pubkey, 'base64').toString('utf8'))
const signatures = collectSignatures(bundleRoot)

if (signatures.length === 0) {
  console.error(`No updater signatures (*.sig) found under ${bundleRoot}`)
  process.exit(1)
}

const mismatches = []
for (const file of signatures) {
  const keyId = keyIdFromMinisignFile(fs.readFileSync(file, 'utf8'))
  if (keyId === expectedKeyId)
    console.log(`ok  ${path.basename(file)} (${keyId})`)
  else
    mismatches.push({ file, keyId })
}

if (mismatches.length > 0) {
  console.error(`\nUpdater signature key mismatch. Configured pubkey id: ${expectedKeyId}`)
  for (const { file, keyId } of mismatches)
    console.error(`  ${file} was signed with ${keyId}`)
  console.error('\nTAURI_SIGNING_PRIVATE_KEY does not match plugins.updater.pubkey in tauri.conf.json.')
  console.error('Installed clients would reject this update with "The signature was created with a different key than the one provided".')
  process.exit(1)
}

console.log(`\nAll ${signatures.length} updater signatures match the configured public key (${expectedKeyId}).`)
