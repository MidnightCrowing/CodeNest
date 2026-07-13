import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeEnum } from '~/constants/appEnums'

import { getPreferredSystemTheme, resolveTheme, watchSystemTheme } from './theme'

describe('theme utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves explicit themes without consulting the system preference', () => {
    expect(resolveTheme(ThemeEnum.Light)).toBe(ThemeEnum.Light)
    expect(resolveTheme(ThemeEnum.Dark)).toBe(ThemeEnum.Dark)
  })

  it('uses matchMedia for system theme resolution', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: true })),
    })

    expect(getPreferredSystemTheme()).toBe(ThemeEnum.Dark)
    expect(resolveTheme(ThemeEnum.System)).toBe(ThemeEnum.Dark)
  })

  it('defaults to light when matchMedia is unavailable', () => {
    vi.stubGlobal('window', {})

    expect(getPreferredSystemTheme()).toBe(ThemeEnum.Light)
  })

  it('watches and unwatches system theme changes', () => {
    const changeListeners: Array<(event: MediaQueryListEvent) => void> = []
    const addEventListener = vi.fn((_event: 'change', listener: (event: MediaQueryListEvent) => void) => {
      changeListeners.push(listener)
    })
    const removeEventListener = vi.fn((_event: 'change', listener: (event: MediaQueryListEvent) => void) => {
      const index = changeListeners.indexOf(listener)
      if (index >= 0)
        changeListeners.splice(index, 1)
    })
    const callback = vi.fn()
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({
        addEventListener,
        matches: false,
        removeEventListener,
      })),
    })

    const stop = watchSystemTheme(callback)
    changeListeners[0]?.({ matches: true } as MediaQueryListEvent)

    expect(callback).toHaveBeenCalledWith(ThemeEnum.Dark)

    stop()

    expect(removeEventListener).toHaveBeenCalled()
    expect(changeListeners).toEqual([])
  })
})
