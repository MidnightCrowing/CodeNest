import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { useProjectSearch } from './useProjectSearch'

function project(overrides: Partial<LocalProject>): LocalProject {
  return {
    appendTime: 1,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: 'Apps',
    kind: ProjectKind.MINE,
    mainLang: 'TypeScript',
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    ...overrides,
  }
}

describe('useProjectSearch', () => {
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

  it('filters projects after the debounce delay', async () => {
    const projects = ref([
      project({ appendTime: 1, name: 'CodeNest', mainLang: 'TypeScript' }),
      project({ appendTime: 2, name: 'CargoTools', mainLang: 'Rust' }),
    ])
    const scope = effectScope()
    const search = scope.run(() => useProjectSearch(projects))!

    search.searchValue.value = 'rust'
    await nextTick()

    expect(search.filterBySearch(projects.value).map(item => item.name)).toEqual([
      'CodeNest',
      'CargoTools',
    ])

    vi.advanceTimersByTime(100)
    await nextTick()

    expect(search.filterBySearch(projects.value).map(item => item.name)).toEqual(['CargoTools'])

    scope.stop()
  })

  it('updates the search index when searchable project fields change', async () => {
    const projects = ref([
      project({ appendTime: 1, name: 'CodeNest', mainLang: 'TypeScript' }),
    ])
    const scope = effectScope()
    const search = scope.run(() => useProjectSearch(projects))!

    projects.value = [
      project({ appendTime: 1, name: 'CodeNest', mainLang: 'TypeScript' }),
      project({ appendTime: 2, name: 'ScannerWorkbench', group: 'Tools', mainLang: 'Rust' }),
    ]
    search.searchValue.value = 'scanner'
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()

    expect(search.filterBySearch(projects.value).map(item => item.name)).toEqual(['ScannerWorkbench'])

    scope.stop()
  })

  it('clears the debounced query immediately when the search value is cleared', async () => {
    const projects = ref([
      project({ appendTime: 1, name: 'CodeNest' }),
      project({ appendTime: 2, name: 'ScannerWorkbench' }),
    ])
    const scope = effectScope()
    const search = scope.run(() => useProjectSearch(projects))!

    search.searchValue.value = 'scanner'
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(search.filterBySearch(projects.value).map(item => item.name)).toEqual(['ScannerWorkbench'])

    search.clearSearch()
    await nextTick()

    expect(search.debouncedSearchValue.value).toBe('')
    expect(search.filterBySearch(projects.value).map(item => item.name)).toEqual([
      'CodeNest',
      'ScannerWorkbench',
    ])

    scope.stop()
  })
})
