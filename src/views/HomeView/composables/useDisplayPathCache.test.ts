import { describe, expect, it, vi } from 'vitest'

import { useDisplayPathCache } from './useDisplayPathCache'

describe('useDisplayPathCache', () => {
  it('returns the original path before a formatted path is cached', () => {
    const cache = useDisplayPathCache()

    expect(cache.displayProjectPath('E:\\Projects\\CodeNest')).toBe('E:\\Projects\\CodeNest')
  })

  it('caches formatted paths from the desktop API', async () => {
    vi.stubGlobal('window', {
      api: {
        formatPath: vi.fn(async () => '~/Projects/CodeNest'),
      },
    })

    const cache = useDisplayPathCache()
    await cache.cacheDisplayPath('E:\\Projects\\CodeNest')

    expect(cache.displayProjectPath('E:\\Projects\\CodeNest')).toBe('~/Projects/CodeNest')
    expect(window.api.formatPath).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent format requests for the same path', async () => {
    vi.stubGlobal('window', {
      api: {
        formatPath: vi.fn(async () => '~/Projects/CodeNest'),
      },
    })

    const cache = useDisplayPathCache()
    await Promise.all([
      cache.cacheDisplayPath('E:\\Projects\\CodeNest'),
      cache.cacheDisplayPath('E:\\Projects\\CodeNest'),
    ])

    expect(window.api.formatPath).toHaveBeenCalledTimes(1)
  })

  it('falls back to the original path when formatting fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('window', {
      api: {
        formatPath: vi.fn(async () => {
          throw new Error('format failed')
        }),
      },
    })

    const cache = useDisplayPathCache()
    await cache.cacheDisplayPath('E:\\Projects\\CodeNest')

    expect(cache.displayProjectPath('E:\\Projects\\CodeNest')).toBe('E:\\Projects\\CodeNest')
  })
})
