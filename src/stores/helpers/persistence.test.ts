import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPersistence } from '~/stores/helpers/persistence'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

describe('createPersistence', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      api: {
        loadData: vi.fn(),
        saveData: vi.fn(),
      },
    })
  })

  it('falls back to cached data when disk loading fails', async () => {
    window.localStorage.setItem('codenest:data:settings', JSON.stringify({ theme: 'dark' }))
    vi.mocked(window.api.loadData).mockResolvedValue({
      success: false,
      error: 'invalid json',
    })

    const persistence = createPersistence<{ theme: string }>({ key: 'settings' })

    await expect(persistence.load()).resolves.toEqual({ theme: 'dark' })
  })

  it('does not update the cache when disk saving fails', async () => {
    window.localStorage.setItem('codenest:data:settings', JSON.stringify({ theme: 'dark' }))
    vi.mocked(window.api.saveData).mockResolvedValue({
      success: false,
      error: 'disk full',
    })

    const persistence = createPersistence<{ theme: string }>({ key: 'settings' })

    await expect(persistence.save({ theme: 'light' })).rejects.toThrow('disk full')
    // 磁盘保存失败时缓存保持旧值,避免下次启动被旧磁盘数据覆盖造成静默丢失
    expect(window.localStorage.getItem('codenest:data:settings')).toBe(JSON.stringify({ theme: 'dark' }))
  })
})
