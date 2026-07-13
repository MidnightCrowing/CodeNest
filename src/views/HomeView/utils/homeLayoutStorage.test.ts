import { afterEach, describe, expect, it, vi } from 'vitest'

import { HOME_LAYOUT_STORAGE_KEY } from '~/constants/storageKeys'

import { persistLayoutMode, readStoredLayoutMode } from './homeLayoutStorage'

function stubStorage(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  vi.stubGlobal('window', {
    localStorage: storage,
  })
}

describe('homeLayoutStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads valid stored layout modes', () => {
    stubStorage({
      getItem: () => 'grid',
      setItem: vi.fn(),
    })

    expect(readStoredLayoutMode()).toBe('grid')
  })

  it('falls back to list for invalid or unavailable storage values', () => {
    stubStorage({
      getItem: () => 'invalid',
      setItem: vi.fn(),
    })
    expect(readStoredLayoutMode()).toBe('list')

    stubStorage({
      getItem: () => {
        throw new Error('storage unavailable')
      },
      setItem: vi.fn(),
    })
    expect(readStoredLayoutMode()).toBe('list')
  })

  it('persists layout mode and ignores storage failures', () => {
    const setItem = vi.fn()
    stubStorage({
      getItem: vi.fn(),
      setItem,
    })

    persistLayoutMode('grid')
    expect(setItem).toHaveBeenCalledWith(HOME_LAYOUT_STORAGE_KEY, 'grid')

    stubStorage({
      getItem: vi.fn(),
      setItem: () => {
        throw new Error('quota exceeded')
      },
    })

    expect(() => persistLayoutMode('list')).not.toThrow()
  })
})
