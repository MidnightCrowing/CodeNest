import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { ViewEnum } from '~/constants/appEnums'

import type { LayoutMode, ScrollAreaRef } from '../types'
import { useProjectNavigation } from './useProjectNavigation'

function createScrollArea(viewport: {
  scrollLeft: number
  scrollTo: (options: { left: number, top: number }) => void
  scrollTop: number
}): ScrollAreaRef {
  return {
    $el: {
      querySelector: () => viewport,
    } as unknown as Element,
  }
}

describe('useProjectNavigation', () => {
  it('remembers and restores scroll for the active layout', async () => {
    const activatedView = ref(ViewEnum.Home)
    const layoutMode = ref<LayoutMode>('list')
    const scrollTo = vi.fn()
    const viewport = {
      scrollLeft: 12,
      scrollTop: 34,
      scrollTo,
    }
    const navigation = useProjectNavigation(
      activatedView,
      layoutMode,
      ref(createScrollArea(viewport)),
      ref(null),
    )

    vi.stubGlobal('window', {
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0)
        return 1
      },
    })

    navigation.navigateFromHome(ViewEnum.Settings)
    viewport.scrollLeft = 0
    viewport.scrollTop = 0
    activatedView.value = ViewEnum.Home
    navigation.restoreHomeScrollPosition()
    await nextTick()

    expect(scrollTo).toHaveBeenCalledWith({ left: 12, top: 34 })
  })

  it('does not restore a snapshot captured for a different layout', async () => {
    const activatedView = ref(ViewEnum.Home)
    const layoutMode = ref<LayoutMode>('list')
    const scrollTo = vi.fn()
    const viewport = {
      scrollLeft: 12,
      scrollTop: 34,
      scrollTo,
    }
    const navigation = useProjectNavigation(
      activatedView,
      layoutMode,
      ref(createScrollArea(viewport)),
      ref(null),
    )

    vi.stubGlobal('window', {
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0)
        return 1
      },
    })

    navigation.navigateFromHome(ViewEnum.Settings)
    layoutMode.value = 'grid'
    navigation.restoreHomeScrollPosition()
    await nextTick()

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
