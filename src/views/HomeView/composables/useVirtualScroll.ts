import type { Ref } from 'vue'
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'

import type { LocalProject } from '~/constants/localProject'

/**
 * 虚拟滚动
 *
 * 管理大列表的增量渲染，通过 IntersectionObserver 实现按需加载。
 * 提高初始渲染性能，避免一次性渲染数千个项目导致卡顿。
 */

const LIST_INITIAL_RENDER_COUNT = 160
const LIST_RENDER_BATCH = 120
const GRID_INITIAL_RENDER_COUNT = 72
const GRID_RENDER_BATCH = 48

export function useVirtualScroll(
  filteredProjects: Ref<LocalProject[]>,
  layoutMode: Ref<'list' | 'grid'>,
) {
  const renderedProjectLimit = ref(LIST_INITIAL_RENDER_COUNT)
  const loadMoreSentinelRef = ref<HTMLElement | null>(null)
  let loadMoreObserver: IntersectionObserver | null = null

  // 根据布局模式计算初始和批次大小
  const initialProjectRenderCount = computed(() =>
    layoutMode.value === 'grid' ? GRID_INITIAL_RENDER_COUNT : LIST_INITIAL_RENDER_COUNT,
  )

  const projectRenderBatch = computed(() =>
    layoutMode.value === 'grid' ? GRID_RENDER_BATCH : LIST_RENDER_BATCH,
  )

  // 当前渲染的项目列表
  const renderedProjects = computed(() =>
    filteredProjects.value.slice(0, renderedProjectLimit.value),
  )

  // 是否还有更多项目待渲染
  const hasMoreProjects = computed(() =>
    renderedProjects.value.length < filteredProjects.value.length,
  )

  /**
   * 重置渲染限制到初始值
   */
  function resetRenderedProjects() {
    renderedProjectLimit.value = initialProjectRenderCount.value
    void nextTick(refreshLoadMoreObserver)
  }

  /**
   * 加载更多项目（增量渲染）
   */
  function showMoreProjects() {
    if (!hasMoreProjects.value)
      return

    renderedProjectLimit.value = Math.min(
      filteredProjects.value.length,
      renderedProjectLimit.value + projectRenderBatch.value,
    )
    void nextTick(refreshLoadMoreObserver)
  }

  /**
   * 设置加载更多的哨兵元素
   */
  function setLoadMoreSentinelRef(element: unknown) {
    loadMoreSentinelRef.value = element instanceof HTMLElement ? element : null
    refreshLoadMoreObserver()
  }

  /**
   * 刷新 IntersectionObserver
   */
  function refreshLoadMoreObserver() {
    loadMoreObserver?.disconnect()
    loadMoreObserver = null

    const sentinel = loadMoreSentinelRef.value
    if (!sentinel || !hasMoreProjects.value)
      return

    // 不支持 IntersectionObserver 时直接渲染所有
    if (!('IntersectionObserver' in window)) {
      renderedProjectLimit.value = filteredProjects.value.length
      return
    }

    loadMoreObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting))
        showMoreProjects()
    }, {
      root: null,
      rootMargin: '160px',
    })
    loadMoreObserver.observe(sentinel)
  }

  /**
   * 确保指定项目已渲染（用于动画等需要 DOM 的场景）
   */
  async function ensureProjectRendered(project: LocalProject) {
    const index = filteredProjects.value.findIndex(item => item.appendTime === project.appendTime)
    if (index < 0 || index < renderedProjectLimit.value)
      return

    renderedProjectLimit.value = Math.min(
      filteredProjects.value.length,
      index + projectRenderBatch.value,
    )
    await nextTick()
    refreshLoadMoreObserver()
  }

  // 监听过滤结果变化，自动重置渲染
  watch(filteredProjects, resetRenderedProjects)

  // 组件卸载时清理 Observer
  onScopeDispose(() => {
    loadMoreObserver?.disconnect()
    loadMoreObserver = null
  })

  return {
    // 状态
    renderedProjects,
    hasMoreProjects,

    // 方法
    resetRenderedProjects,
    showMoreProjects,
    setLoadMoreSentinelRef,
    refreshLoadMoreObserver,
    ensureProjectRendered,
  }
}
