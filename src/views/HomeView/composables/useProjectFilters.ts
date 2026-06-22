import type { Ref } from 'vue'
import { computed, ref } from 'vue'

import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'
import { formatProjectLanguage } from '~/utils/projectFormatters'

type KindFilter = ProjectKind | 'all'
type StatusFilter = 'all' | 'available' | 'missing' | 'temporary' | 'archived'
type SortKey = 'recent' | 'name' | 'language' | 'group'

interface FilterOption<T extends string> {
  value: T
  label: string
  color?: string
  count?: number
}

interface ProjectSearchComposable {
  searchValue: Ref<string>
  debouncedSearchValue: Ref<string>
  filterBySearch: (projects: LocalProject[]) => LocalProject[]
}

/**
 * 项目过滤、排序和统计
 *
 * 集成搜索、类型、状态、语言过滤器，以及排序和统计功能。
 * 统一管理过滤条件的交互和计数显示。
 */
export function useProjectFilters(
  projectSearch: ProjectSearchComposable,
  t: (key: string, params?: Record<string, unknown>) => string,
) {
  const projectsStore = useProjectsStore()

  const kindFilter = ref<KindFilter>('all')
  const statusFilter = ref<StatusFilter>('all')
  const languageFilter = ref('all')
  const sortKey = ref<SortKey>('recent')

  // 统计数据
  const totalProjects = computed(() => projectsStore.activeProjects.length)
  const archivedProjectsCount = computed(() => projectsStore.archivedProjects.length)

  const projectStats = computed(() => {
    const byKind = new Map<ProjectKind, number>()
    let available = 0
    let missing = 0
    let temporary = 0

    for (const project of projectsStore.activeProjects) {
      byKind.set(project.kind, (byKind.get(project.kind) || 0) + 1)

      if (project.isExists)
        available += 1
      else
        missing += 1

      if (project.isTemporary)
        temporary += 1
    }

    return {
      total: projectsStore.allProjects.length,
      available,
      missing,
      temporary,
      byKind,
    }
  })

  const availableProjects = computed(() => projectStats.value.available)
  const missingProjects = computed(() => projectStats.value.missing)
  const temporaryProjects = computed(() => projectStats.value.temporary)

  function countByKind(kind: ProjectKind) {
    return projectStats.value.byKind.get(kind) || 0
  }

  // 过滤器选项
  const kindOptions = computed<Array<FilterOption<KindFilter>>>(() => [
    { value: 'all', label: t('app.home.filters.all_projects'), count: totalProjects.value },
    { value: ProjectKind.MINE, label: t('app.project_kind.mine'), count: countByKind(ProjectKind.MINE) },
    { value: ProjectKind.FORK, label: t('app.project_kind.forks'), count: countByKind(ProjectKind.FORK) },
    { value: ProjectKind.CLONE, label: t('app.project_kind.clones'), count: countByKind(ProjectKind.CLONE) },
  ])

  const statusOptions = computed<Array<FilterOption<StatusFilter>>>(() => [
    { value: 'all', label: t('app.home.filters.active'), count: totalProjects.value },
    { value: 'available', label: t('app.home.filters.available'), count: availableProjects.value },
    { value: 'missing', label: t('app.home.filters.missing_path'), count: missingProjects.value },
    { value: 'temporary', label: t('app.home.filters.temporary'), count: temporaryProjects.value },
    { value: 'archived', label: t('app.home.filters.archived'), count: archivedProjectsCount.value },
  ])

  const sortOptions = computed<Array<FilterOption<SortKey>>>(() => [
    { value: 'recent', label: t('app.home.sort.recent') },
    { value: 'name', label: t('app.home.sort.name') },
    { value: 'language', label: t('app.home.sort.language') },
    { value: 'group', label: t('app.home.sort.group') },
  ])

  const languages = computed(() =>
    [...projectsStore.mainLangSummary].sort((a, b) =>
      b.count - a.count || a.text.localeCompare(b.text),
    ),
  )

  const languageOptions = computed(() => [
    { value: 'all', label: t('app.home.filters.all_languages'), count: totalProjects.value },
    ...languages.value.map(language => ({
      value: language.text,
      label: formatProjectLanguage(language.text, t),
      color: language.color,
      count: language.count,
    })),
  ])

  // 激活的过滤器数量
  const activeFilterCount = computed(() =>
    Number(!!projectSearch.searchValue.value.trim())
    + Number(kindFilter.value !== 'all')
    + Number(statusFilter.value !== 'all')
    + Number(languageFilter.value !== 'all'),
  )

  // 排序辅助函数
  function recentSortTime(project: LocalProject) {
    return project.lastOpenedAt ?? project.appendTime
  }

  function compareProjects(a: LocalProject, b: LocalProject) {
    if (!!a.isPinned !== !!b.isPinned)
      return a.isPinned ? -1 : 1

    switch (sortKey.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'language':
        return (a.mainLang || '').localeCompare(b.mainLang || '') || a.name.localeCompare(b.name)
      case 'group':
        return (a.group || '').localeCompare(b.group || '') || a.name.localeCompare(b.name)
      case 'recent':
      default:
        return recentSortTime(b) - recentSortTime(a)
    }
  }

  // 过滤和排序后的项目列表
  const filteredProjects = computed(() => {
    // 归档视图 vs 活跃视图的基础数据源分离
    let result = statusFilter.value === 'archived'
      ? projectsStore.archivedProjects
      : projectsStore.activeProjects

    if (kindFilter.value !== 'all')
      result = result.filter(project => project.kind === kindFilter.value)

    // 归档视图下忽略其他 status 细分过滤
    if (statusFilter.value !== 'archived') {
      if (statusFilter.value === 'available')
        result = result.filter(project => project.isExists)

      if (statusFilter.value === 'missing')
        result = result.filter(project => !project.isExists)

      if (statusFilter.value === 'temporary')
        result = result.filter(project => project.isTemporary)
    }

    if (languageFilter.value !== 'all')
      result = result.filter(project => project.mainLang === languageFilter.value)

    // 搜索过滤
    result = projectSearch.filterBySearch(result)

    return [...result].sort(compareProjects)
  })

  // 清除所有过滤器
  function clearFilters() {
    projectSearch.searchValue.value = ''
    kindFilter.value = 'all'
    statusFilter.value = 'all'
    languageFilter.value = 'all'
  }

  return {
    // 过滤器状态
    kindFilter,
    statusFilter,
    languageFilter,
    sortKey,

    // 统计数据
    projectStats,
    totalProjects,
    archivedProjectsCount,
    availableProjects,
    missingProjects,
    temporaryProjects,

    // 选项列表
    kindOptions,
    statusOptions,
    languageOptions,
    sortOptions,

    // 计算结果
    filteredProjects,
    activeFilterCount,

    // 方法
    clearFilters,
    countByKind,
  }
}
