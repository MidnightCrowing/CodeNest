import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { LicenseEnum } from '~/constants/license'
import type { languagesGroupItem } from '~/constants/localProject'
import { createPersistence } from '~/stores/helpers/persistence'

export interface ProjectScannerCacheEntry {
  path: string
  signature: string
  name: string
  mainLang?: string
  mainLangColor?: `#${string}`
  langGroup?: languagesGroupItem[]
  ide?: string | null
  error?: string
  license?: LicenseEnum
}

const scannerPersistence = createPersistence<{
  historyScannedPaths: string[]
  scanCache?: ProjectScannerCacheEntry[]
}>({
  key: 'projectScanner',
})

const WINDOWS_VERBATIM_UNC_RE = /^\\\\\?\\UNC\\/
const WINDOWS_VERBATIM_RE = /^\\\\\?\\/

function stripWindowsVerbatimPrefix(path: string) {
  if (WINDOWS_VERBATIM_UNC_RE.test(path))
    return path.replace(WINDOWS_VERBATIM_UNC_RE, '\\\\')
  return path.replace(WINDOWS_VERBATIM_RE, '')
}

function normalizePathKey(path: string) {
  const normalized = stripWindowsVerbatimPrefix(path).trim().replaceAll('\\', '/').replace(/\/+$/, '')
  return navigator.userAgent.includes('Windows') ? normalized.toLowerCase() : normalized
}

export const useProjectScannerStore = defineStore('projectScanner', () => {
  const historyScannedPaths = ref<Set<string>>(new Set())
  const scanCache = ref<Map<string, ProjectScannerCacheEntry>>(new Map())

  const allHistoryScannedPaths = computed(() => historyScannedPaths.value)
  const scanCacheEntries = computed(() =>
    Array.from(scanCache.value.values()).sort((a, b) => a.path.localeCompare(b.path)),
  )

  function addScannedPath(path: string) {
    historyScannedPaths.value.add(stripWindowsVerbatimPrefix(path))
  }

  function getScanCacheEntry(path: string) {
    return scanCache.value.get(normalizePathKey(path))
  }

  function setScanCacheEntry(entry: ProjectScannerCacheEntry) {
    if (!entry.path || !entry.signature)
      return

    const path = stripWindowsVerbatimPrefix(entry.path)
    scanCache.value.set(normalizePathKey(path), {
      ...entry,
      path,
    })
  }

  async function loadProjectScannerData() {
    const data = await scannerPersistence.load()
    if (data && Array.isArray(data.historyScannedPaths)) {
      historyScannedPaths.value = new Set(data.historyScannedPaths.map(stripWindowsVerbatimPrefix))
    }
    if (data && Array.isArray(data.scanCache)) {
      scanCache.value = new Map(
        data.scanCache
          .filter(entry => entry.path && entry.signature)
          .map(entry => [normalizePathKey(entry.path), {
            ...entry,
            path: stripWindowsVerbatimPrefix(entry.path),
          }]),
      )
    }
  }

  function clearProjectScannerData() {
    historyScannedPaths.value.clear()
    scanCache.value.clear()
    scannerPersistence.clearCache()
    void window.api.deleteData('projectScanner')
  }

  async function saveProjectScannerData() {
    await scannerPersistence.save({
      historyScannedPaths: Array.from(historyScannedPaths.value).sort(),
      scanCache: scanCacheEntries.value,
    })
  }

  return {
    allHistoryScannedPaths,
    scanCacheEntries,
    addScannedPath,
    getScanCacheEntry,
    setScanCacheEntry,
    clearProjectScannerData,
    loadProjectScannerData,
    saveProjectScannerData,
  }
})
