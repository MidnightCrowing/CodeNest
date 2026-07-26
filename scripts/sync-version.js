import fs from 'node:fs'

const packageJsonPath = new URL('../package.json', import.meta.url)
const tauriConfigPath = new URL('../src-tauri/tauri.conf.json', import.meta.url)
const cargoTomlPath = new URL('../src-tauri/Cargo.toml', import.meta.url)
const cargoLockPath = new URL('../src-tauri/Cargo.lock', import.meta.url)

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function writeJson(path, data) {
  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

const version = readJson(packageJsonPath).version
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) {
  throw new Error(`Unsupported package version: ${version}`)
}

const tauriConfig = readJson(tauriConfigPath)
tauriConfig.version = version
writeJson(tauriConfigPath, tauriConfig)

const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8')
const cargoVersionRe = /^version\s*=\s*".*"$/m

if (!cargoVersionRe.test(cargoToml)) {
  throw new Error('Could not find package version in src-tauri/Cargo.toml')
}

const nextCargoToml = cargoToml.replace(cargoVersionRe, `version = "${version}"`)
fs.writeFileSync(cargoTomlPath, nextCargoToml)

const cargoLock = fs.readFileSync(cargoLockPath, 'utf8')
const cargoLockPackageRe = /(\[\[package\]\]\r?\nname\s*=\s*"codenest"\r?\nversion\s*=\s*")[^"]+("\r?\n)/

if (!cargoLockPackageRe.test(cargoLock)) {
  throw new Error('Could not find the codenest package version in src-tauri/Cargo.lock')
}

const nextCargoLock = cargoLock.replace(cargoLockPackageRe, `$1${version}$2`)
fs.writeFileSync(cargoLockPath, nextCargoLock)
