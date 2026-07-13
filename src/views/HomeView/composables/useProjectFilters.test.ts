import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'

import { useProjectFilters } from './useProjectFilters'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

function project(overrides: Partial<LocalProject>): LocalProject {
  return {
    appendTime: 1,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: '',
    kind: ProjectKind.MINE,
    mainLang: 'TypeScript',
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    ...overrides,
  }
}

function createFilters(filterBySearch: (projects: LocalProject[]) => LocalProject[] = projects => projects) {
  return useProjectFilters(
    {
      searchValue: ref(''),
      debouncedSearchValue: ref(''),
      filterBySearch,
    },
    key => key,
  )
}

describe('useProjectFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      api: {
        saveData: vi.fn(async () => ({ success: true })),
      },
    })
  })

  it('counts active, archived, missing, temporary, and kind totals', () => {
    const projectsStore = useProjectsStore()
    projectsStore.projects.push(
      project({ appendTime: 1, kind: ProjectKind.MINE }),
      project({ appendTime: 2, kind: ProjectKind.FORK, isExists: false }),
      project({ appendTime: 3, kind: ProjectKind.CLONE, isTemporary: true }),
      project({ appendTime: 4, kind: ProjectKind.MINE, isArchived: true }),
    )

    const filters = createFilters()

    expect(filters.totalProjects.value).toBe(3)
    expect(filters.archivedProjectsCount.value).toBe(1)
    expect(filters.missingProjects.value).toBe(1)
    expect(filters.temporaryProjects.value).toBe(1)
    expect(filters.countByKind(ProjectKind.MINE)).toBe(1)
    expect(filters.countByKind(ProjectKind.FORK)).toBe(1)
    expect(filters.countByKind(ProjectKind.CLONE)).toBe(1)
  })

  it('filters by status, kind, language, and external search result', () => {
    const projectsStore = useProjectsStore()
    projectsStore.projects.push(
      project({ appendTime: 1, name: 'CodeNest', kind: ProjectKind.MINE, mainLang: 'TypeScript' }),
      project({ appendTime: 2, name: 'RustScan', kind: ProjectKind.FORK, mainLang: 'Rust' }),
      project({ appendTime: 3, name: 'MissingRust', kind: ProjectKind.FORK, mainLang: 'Rust', isExists: false }),
    )

    const filters = createFilters(projects => projects.filter(item => item.name.includes('Rust')))
    filters.kindFilter.value = ProjectKind.FORK
    filters.languageFilter.value = 'Rust'

    expect(filters.filteredProjects.value.map(item => item.name)).toEqual([
      'MissingRust',
      'RustScan',
    ])

    filters.statusFilter.value = 'missing'

    expect(filters.filteredProjects.value.map(item => item.name)).toEqual(['MissingRust'])
  })

  it('keeps pinned projects first while changing sort keys', () => {
    const projectsStore = useProjectsStore()
    projectsStore.projects.push(
      project({ appendTime: 1, name: 'Beta', group: 'B', mainLang: 'TypeScript', lastOpenedAt: 20 }),
      project({ appendTime: 2, name: 'Alpha', group: 'A', mainLang: 'Rust', lastOpenedAt: 10 }),
      project({ appendTime: 3, name: 'Pinned', group: 'Z', mainLang: 'Go', isPinned: true, lastOpenedAt: 1 }),
    )

    const filters = createFilters()

    filters.sortKey.value = 'name'
    expect(filters.filteredProjects.value.map(item => item.name)).toEqual(['Pinned', 'Alpha', 'Beta'])

    filters.sortKey.value = 'recent'
    expect(filters.filteredProjects.value.map(item => item.name)).toEqual(['Pinned', 'Beta', 'Alpha'])
  })

  it('clears active filters', () => {
    const filters = createFilters()
    filters.kindFilter.value = ProjectKind.FORK
    filters.statusFilter.value = 'missing'
    filters.languageFilter.value = 'TypeScript'

    expect(filters.activeFilterCount.value).toBe(3)

    filters.clearFilters()

    expect(filters.kindFilter.value).toBe('all')
    expect(filters.statusFilter.value).toBe('all')
    expect(filters.languageFilter.value).toBe('all')
    expect(filters.activeFilterCount.value).toBe(0)
  })
})
