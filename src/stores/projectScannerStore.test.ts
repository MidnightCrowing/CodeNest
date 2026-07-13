import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useProjectScannerStore } from './projectScannerStore'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

describe('projectScannerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.stubGlobal('navigator', {
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      api: {
        deleteData: vi.fn(async () => ({ success: true })),
        loadData: vi.fn(async () => ({ success: false })),
        saveData: vi.fn(async () => ({ success: true })),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('normalizes scanned paths and cache lookup keys', () => {
    const scannerStore = useProjectScannerStore()

    scannerStore.addScannedPath('\\\\?\\E:\\Projects\\CodeNest')
    scannerStore.setScanCacheEntry({
      path: '\\\\?\\E:\\Projects\\CodeNest',
      signature: 'sig',
      name: 'CodeNest',
      mainLang: 'TypeScript',
    })

    expect([...scannerStore.allHistoryScannedPaths]).toEqual(['E:\\Projects\\CodeNest'])
    expect(scannerStore.getScanCacheEntry('e:/projects/codenest/')).toMatchObject({
      path: 'E:\\Projects\\CodeNest',
      signature: 'sig',
      name: 'CodeNest',
    })
  })

  it('expires stale cache entries', () => {
    const scannerStore = useProjectScannerStore()

    scannerStore.setScanCacheEntry({
      path: 'E:\\Projects\\CodeNest',
      signature: 'sig',
      name: 'CodeNest',
    })
    vi.setSystemTime(new Date('2026-02-01T00:00:01Z'))

    expect(scannerStore.getScanCacheEntry('E:\\Projects\\CodeNest')).toBeUndefined()
    expect(scannerStore.scanCacheEntries).toEqual([])
  })

  it('removes the oldest cache entry when the cache exceeds the limit', () => {
    const scannerStore = useProjectScannerStore()

    for (let index = 0; index <= 1000; index += 1) {
      vi.setSystemTime(new Date(1000 + index))
      scannerStore.setScanCacheEntry({
        path: `E:\\Projects\\Project-${index}`,
        signature: `sig-${index}`,
        name: `Project-${index}`,
      })
    }

    expect(scannerStore.scanCacheEntries).toHaveLength(1000)
    expect(scannerStore.getScanCacheEntry('E:\\Projects\\Project-0')).toBeUndefined()
    expect(scannerStore.getScanCacheEntry('E:\\Projects\\Project-1000')).toMatchObject({
      name: 'Project-1000',
    })
  })

  it('clears scanner data from memory, cache, and disk', () => {
    const scannerStore = useProjectScannerStore()

    scannerStore.addScannedPath('E:\\Projects\\CodeNest')
    scannerStore.setScanCacheEntry({
      path: 'E:\\Projects\\CodeNest',
      signature: 'sig',
      name: 'CodeNest',
    })

    scannerStore.clearProjectScannerData()

    expect([...scannerStore.allHistoryScannedPaths]).toEqual([])
    expect(scannerStore.scanCacheEntries).toEqual([])
    expect(window.api.deleteData).toHaveBeenCalledWith('projectScanner')
  })
})
