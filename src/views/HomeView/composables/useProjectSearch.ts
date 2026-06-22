import Fuse from 'fuse.js'
import type { Ref } from 'vue'
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'

import type { LocalProject } from '~/constants/localProject'

/**
 * 项目搜索（Fuse.js）
 *
 * 提供基于 Fuse.js 的模糊搜索能力，带防抖和索引缓存优化。
 * 索引仅在搜索相关字段变化时重建，避免无关更新（如 isExists）触发昂贵的索引重建。
 */

const SEARCH_DEBOUNCE_MS = 100

export function useProjectSearch(allProjects: Ref<LocalProject[]>) {
  const searchValue = ref('')
  const debouncedSearchValue = ref('')
  let searchDebounceTimer: ReturnType<typeof window.setTimeout> | null = null

  // Fuse 索引签名：仅包含搜索相关字段，避免无关更新触发重建
  const projectSearchSignature = computed(() =>
    allProjects.value
      .map(p => `${p.appendTime}\0${p.name}\0${p.group}\0${p.path}\0${p.mainLang}\0${p.defaultOpen}`)
      .join('\n'),
  )

  const projectSearchIndex = shallowRef<Fuse<LocalProject>>(new Fuse<LocalProject>([], {
    keys: ['name', 'group', 'path', 'mainLang', 'defaultOpen'],
    threshold: 0.35,
    shouldSort: true,
  }))

  // 索引重建：仅在搜索签名变化时触发
  watch(projectSearchSignature, () => {
    projectSearchIndex.value = new Fuse([...allProjects.value], {
      keys: ['name', 'group', 'path', 'mainLang', 'defaultOpen'],
      threshold: 0.35,
      shouldSort: true,
    })
  }, { immediate: true })

  // 防抖：100ms
  watch(searchValue, (value) => {
    if (searchDebounceTimer !== null) {
      window.clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }

    if (!value) {
      debouncedSearchValue.value = ''
      return
    }

    searchDebounceTimer = window.setTimeout(() => {
      debouncedSearchValue.value = value
      searchDebounceTimer = null
    }, SEARCH_DEBOUNCE_MS)
  })

  /**
   * 清空搜索框
   */
  function clearSearch() {
    searchValue.value = ''
  }

  /**
   * 根据搜索关键词过滤项目列表
   * @param projects 待过滤的项目列表
   * @returns 匹配的项目列表
   */
  function filterBySearch(projects: LocalProject[]): LocalProject[] {
    const query = debouncedSearchValue.value.trim()
    if (!query)
      return projects

    const matchedProjectIds = new Set(
      projectSearchIndex.value.search(query).map(match => match.item.appendTime),
    )
    return projects.filter(project => matchedProjectIds.has(project.appendTime))
  }

  // 组件卸载时清理定时器
  onScopeDispose(() => {
    if (searchDebounceTimer !== null) {
      window.clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }
  })

  return {
    searchValue,
    debouncedSearchValue: computed(() => debouncedSearchValue.value),
    clearSearch,
    filterBySearch,
  }
}
