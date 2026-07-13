import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import { useDelayedBusy, useDelayedBusyKeys } from './useDelayedBusy'

describe('useDelayedBusy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('window', {
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not show when busy ends before the delay', async () => {
    const busy = ref(false)
    const scope = effectScope()
    const visible = scope.run(() => useDelayedBusy(busy, { delay: 100, minDuration: 200 }))!

    busy.value = true
    await nextTick()
    vi.advanceTimersByTime(99)
    await nextTick()
    busy.value = false
    await nextTick()
    vi.advanceTimersByTime(1)

    expect(visible.value).toBe(false)
    scope.stop()
  })

  it('stays visible for the minimum duration once shown', async () => {
    const busy = ref(false)
    const scope = effectScope()
    const visible = scope.run(() => useDelayedBusy(busy, { delay: 100, minDuration: 200 }))!

    busy.value = true
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()

    expect(visible.value).toBe(true)

    busy.value = false
    await nextTick()
    vi.advanceTimersByTime(199)
    await nextTick()
    expect(visible.value).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(visible.value).toBe(false)
    scope.stop()
  })
})

describe('useDelayedBusyKeys', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('window', {
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('tracks delayed visibility per key', async () => {
    const scope = effectScope()
    const busy = scope.run(() => useDelayedBusyKeys<string>({ delay: 100, minDuration: 200 }))!

    busy.setKeyBusy('scan', true)
    vi.advanceTimersByTime(99)
    await nextTick()
    expect(busy.visibleKeys.value.has('scan')).toBe(false)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(busy.visibleKeys.value.has('scan')).toBe(true)

    busy.setKeyBusy('scan', false)
    vi.advanceTimersByTime(199)
    await nextTick()
    expect(busy.visibleKeys.value.has('scan')).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(busy.visibleKeys.value.has('scan')).toBe(false)
    scope.stop()
  })

  it('does not show keys that stop before the delay', async () => {
    const scope = effectScope()
    const busy = scope.run(() => useDelayedBusyKeys<string>({ delay: 100, minDuration: 200 }))!

    busy.setKeyBusy('scan', true)
    busy.setKeyBusy('scan', false)
    vi.advanceTimersByTime(100)
    await nextTick()

    expect(busy.visibleKeys.value.has('scan')).toBe(false)
    scope.stop()
  })
})
