import type { Ref } from 'vue'
import { nextTick, ref } from 'vue'

import type { ViewEnum } from '~/constants/appEnums'

import type { LayoutMode, ScrollAreaRef } from '../types'

/**
 * 项目导航和滚动位置管理
 *
 * 负责管理 Home 视图的滚动位置记忆和恢复，确保从其他视图返回时能恢复到之前的滚动位置。
 * 支持列表和卡片两种布局模式的独立滚动状态。
 */

interface HomeScrollSnapshot {
  layoutMode: LayoutMode
  scrollLeft: number
  scrollTop: number
}

export function useProjectNavigation(
  activatedView: Ref<ViewEnum>,
  layoutMode: Ref<LayoutMode>,
  listScrollAreaRef: Ref<ScrollAreaRef | null>,
  cardsScrollAreaRef: Ref<ScrollAreaRef | null>,
) {
  const homeScrollSnapshot = ref<HomeScrollSnapshot | null>(null)
  const shouldRestoreHomeScroll = ref(false)

  function activeScrollAreaRef() {
    return layoutMode.value === 'list' ? listScrollAreaRef.value : cardsScrollAreaRef.value
  }

  function activeScrollViewport() {
    return activeScrollAreaRef()?.$el?.querySelector<HTMLElement>('.ui-scroll-viewport') ?? null
  }

  function rememberHomeScrollPosition() {
    const viewport = activeScrollViewport()
    if (!viewport)
      return

    homeScrollSnapshot.value = {
      layoutMode: layoutMode.value,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    }
    shouldRestoreHomeScroll.value = true
  }

  function navigateFromHome(view: ViewEnum) {
    rememberHomeScrollPosition()
    activatedView.value = view
  }

  function restoreHomeScrollPosition() {
    const snapshot = homeScrollSnapshot.value
    if (!shouldRestoreHomeScroll.value || !snapshot || snapshot.layoutMode !== layoutMode.value)
      return

    let attempts = 0
    const restore = () => {
      attempts += 1
      const viewport = activeScrollViewport()
      if (!viewport && attempts < 4) {
        window.requestAnimationFrame(restore)
        return
      }
      if (!viewport)
        return

      viewport.scrollTo({
        left: snapshot.scrollLeft,
        top: snapshot.scrollTop,
      })
      shouldRestoreHomeScroll.value = false
    }

    void nextTick(() => window.requestAnimationFrame(restore))
  }

  return {
    navigateFromHome,
    restoreHomeScrollPosition,
  }
}
