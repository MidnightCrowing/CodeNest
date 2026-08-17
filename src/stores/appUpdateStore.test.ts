import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppUpdateStore } from '~/stores/appUpdateStore'

describe('appUpdateStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('window', {
      api: {
        checkUpdate: vi.fn(),
        installUpdate: vi.fn(),
      },
    })
  })

  it('tracks an available update and download progress', async () => {
    vi.mocked(window.api.checkUpdate).mockResolvedValue({
      hasUpdate: true,
      currentVersion: '1.1.1',
      latestVersion: '1.2.0',
    })
    vi.mocked(window.api.installUpdate).mockImplementation(async (onEvent) => {
      onEvent({ event: 'Started', data: { contentLength: 4000 } })
      onEvent({ event: 'Progress', data: { chunkLength: 1000 } })
      onEvent({ event: 'Finished' })
    })
    const store = useAppUpdateStore()

    await expect(store.checkUpdate()).resolves.toMatchObject({ latestVersion: '1.2.0' })
    expect(store.status).toBe('available')

    await expect(store.installUpdate()).resolves.toBe(true)
    expect(store.downloadedBytes).toBe(1000)
    expect(store.contentLength).toBe(4000)
    expect(store.downloadProgress).toBe(25)
    expect(store.status).toBe('installing')
  })

  it('marks the current version as latest when no update exists', async () => {
    vi.mocked(window.api.checkUpdate).mockResolvedValue({
      hasUpdate: false,
      currentVersion: '1.1.1',
    })
    const store = useAppUpdateStore()

    await store.checkUpdate()

    expect(store.status).toBe('latest')
    expect(store.updateInfo?.hasUpdate).toBe(false)
  })

  it('exposes update errors without throwing into the UI', async () => {
    vi.mocked(window.api.checkUpdate).mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useAppUpdateStore()

    await expect(store.checkUpdate()).resolves.toBeNull()

    expect(store.status).toBe('error')
    expect(store.error).toContain('offline')
  })
})
