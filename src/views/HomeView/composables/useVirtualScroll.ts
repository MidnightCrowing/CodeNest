import type { Ref } from 'vue'
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'

import type { LocalProject } from '~/constants/localProject'

const LIST_INITIAL_RENDER_COUNT = 160
const LIST_RENDER_BATCH = 120
const GRID_INITIAL_RENDER_COUNT = 72
const GRID_RENDER_BATCH = 48

export function useVirtualScroll(
  filteredProjects: Ref<LocalProject[]>,
  layoutMode: Ref<'list' | 'grid'>,
) {
  const renderedProjectLimit = ref(
    layoutMode.value === 'grid' ? GRID_INITIAL_RENDER_COUNT : LIST_INITIAL_RENDER_COUNT,
  )
  const loadMoreSentinelRef = ref<HTMLElement | null>(null)
  let loadMoreObserver: IntersectionObserver | null = null

  const initialProjectRenderCount = computed(() =>
    layoutMode.value === 'grid' ? GRID_INITIAL_RENDER_COUNT : LIST_INITIAL_RENDER_COUNT,
  )

  const projectRenderBatch = computed(() =>
    layoutMode.value === 'grid' ? GRID_RENDER_BATCH : LIST_RENDER_BATCH,
  )

  const renderedProjects = computed(() =>
    filteredProjects.value.slice(0, renderedProjectLimit.value),
  )

  const hasMoreProjects = computed(() =>
    renderedProjects.value.length < filteredProjects.value.length,
  )

  function resetRenderedProjects() {
    renderedProjectLimit.value = initialProjectRenderCount.value
    void nextTick(refreshLoadMoreObserver)
  }

  function showMoreProjects() {
    if (!hasMoreProjects.value)
      return

    renderedProjectLimit.value = Math.min(
      filteredProjects.value.length,
      renderedProjectLimit.value + projectRenderBatch.value,
    )
    void nextTick(refreshLoadMoreObserver)
  }

  /** IntersectionObserver 哨兵；进入视口时加载下一批 */
  function setLoadMoreSentinelRef(element: unknown) {
    loadMoreSentinelRef.value = element instanceof HTMLElement ? element : null
    refreshLoadMoreObserver()
  }

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

  /** 目标尚未渲染时先扩展可见范围（动画等需要真实 DOM） */
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

  watch(filteredProjects, resetRenderedProjects)

  onScopeDispose(() => {
    loadMoreObserver?.disconnect()
    loadMoreObserver = null
  })

  return {
    renderedProjects,
    hasMoreProjects,

    resetRenderedProjects,
    showMoreProjects,
    setLoadMoreSentinelRef,
    refreshLoadMoreObserver,
    ensureProjectRendered,
  }
}
