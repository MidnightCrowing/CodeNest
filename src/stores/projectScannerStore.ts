import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { LicenseEnum } from '~/constants/license'
import type { languagesGroupItem } from '~/constants/localProject'
import { createPersistence } from '~/stores/helpers/persistence'
import { normalizePathKey, stripWindowsVerbatimPrefix } from '~/utils/path'

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

const MAX_CACHE_SIZE = 1000
const CACHE_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30天

export interface ProjectScannerCacheEntryWithTimestamp extends ProjectScannerCacheEntry {
  cachedAt?: number
}

export const useProjectScannerStore = defineStore('projectScanner', () => {
  const historyScannedPaths = ref<Set<string>>(new Set())
  const scanCache = ref<Map<string, ProjectScannerCacheEntryWithTimestamp>>(new Map())

  const allHistoryScannedPaths = computed(() => historyScannedPaths.value)
  const scanCacheEntries = computed(() =>
    Array.from(scanCache.value.values()).sort((a, b) => a.path.localeCompare(b.path)),
  )

  function addScannedPath(path: string) {
    historyScannedPaths.value.add(stripWindowsVerbatimPrefix(path))
  }

  function getScanCacheEntry(path: string) {
    const entry = scanCache.value.get(normalizePathKey(path))
    if (!entry)
      return undefined

    // 检查缓存是否过期
    const cachedAt = entry.cachedAt ?? 0
    if (Date.now() - cachedAt > CACHE_EXPIRY_MS) {
      scanCache.value.delete(normalizePathKey(path))
      return undefined
    }

    return entry
  }

  function setScanCacheEntry(entry: ProjectScannerCacheEntry) {
    if (!entry.path || !entry.signature)
      return

    const path = stripWindowsVerbatimPrefix(entry.path)
    const entryWithTimestamp: ProjectScannerCacheEntryWithTimestamp = {
      ...entry,
      path,
      cachedAt: Date.now(),
    }

    scanCache.value.set(normalizePathKey(path), entryWithTimestamp)

    // LRU: 如果缓存超过限制,删除最旧的条目
    if (scanCache.value.size > MAX_CACHE_SIZE) {
      let oldestKey: string | null = null
      let oldestTime = Number.POSITIVE_INFINITY

      for (const [key, value] of scanCache.value.entries()) {
        const cachedAt = value.cachedAt ?? 0
        if (cachedAt < oldestTime) {
          oldestTime = cachedAt
          oldestKey = key
        }
      }

      if (oldestKey) {
        scanCache.value.delete(oldestKey)
      }
    }
  }

  async function loadProjectScannerData() {
    const data = await scannerPersistence.load()
    if (data && Array.isArray(data.historyScannedPaths)) {
      historyScannedPaths.value = new Set(data.historyScannedPaths.map(stripWindowsVerbatimPrefix))
    }
    if (data && Array.isArray(data.scanCache)) {
      const now = Date.now()
      let expiredCount = 0
      scanCache.value = new Map(
        data.scanCache
          .filter(entry => entry.path && entry.signature)
          .map((entry) => {
            const typedEntry = entry as ProjectScannerCacheEntryWithTimestamp
            const cachedAt = typedEntry.cachedAt ?? 0
            // 过滤过期的缓存条目
            if (now - cachedAt > CACHE_EXPIRY_MS) {
              expiredCount++
              return null
            }
            return [normalizePathKey(entry.path), {
              ...entry,
              path: stripWindowsVerbatimPrefix(entry.path),
              cachedAt,
            }]
          })
          .filter(Boolean) as Array<[string, ProjectScannerCacheEntryWithTimestamp]>,
      )

      // 如果有过期条目,持久化清理后的缓存
      if (expiredCount > 0) {
        console.warn(`Cleaned ${expiredCount} expired cache entries`)
        void saveProjectScannerData()
      }
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
