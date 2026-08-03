import Fuse from 'fuse.js'
import type { Ref } from 'vue'
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'

import type { LocalProject } from '~/constants/localProject'

const SEARCH_DEBOUNCE_MS = 100

export function useProjectSearch(allProjects: Ref<LocalProject[]>) {
  const searchValue = ref('')
  const debouncedSearchValue = ref('')
  let searchDebounceTimer: ReturnType<typeof window.setTimeout> | null = null

  // 仅包含搜索字段，避免 isExists 等无关更新重建索引
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

  watch(projectSearchSignature, () => {
    projectSearchIndex.value = new Fuse([...allProjects.value], {
      keys: ['name', 'group', 'path', 'mainLang', 'defaultOpen'],
      threshold: 0.35,
      shouldSort: true,
    })
  }, { immediate: true })

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

  function clearSearch() {
    searchValue.value = ''
  }

  function filterBySearch(projects: LocalProject[]): LocalProject[] {
    const query = debouncedSearchValue.value.trim()
    if (!query)
      return projects

    const matchedProjectIds = new Set(
      projectSearchIndex.value.search(query).map(match => match.item.appendTime),
    )
    return projects.filter(project => matchedProjectIds.has(project.appendTime))
  }

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
