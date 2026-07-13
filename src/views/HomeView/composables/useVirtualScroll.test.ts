import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { useVirtualScroll } from './useVirtualScroll'

function project(appendTime: number): LocalProject {
  return {
    appendTime,
    path: `E:\\Projects\\Project-${appendTime}`,
    name: `Project-${appendTime}`,
    group: '',
    kind: ProjectKind.MINE,
    mainLang: 'TypeScript',
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
  }
}

describe('useVirtualScroll', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses larger initial and batch sizes for list layout', () => {
    const scope = effectScope()
    const projects = ref(Array.from({ length: 400 }, (_, index) => project(index + 1)))
    const layoutMode = ref<'list' | 'grid'>('list')
    const virtualScroll = scope.run(() => useVirtualScroll(projects, layoutMode))!

    expect(virtualScroll.renderedProjects.value).toHaveLength(160)
    expect(virtualScroll.hasMoreProjects.value).toBe(true)

    virtualScroll.showMoreProjects()

    expect(virtualScroll.renderedProjects.value).toHaveLength(280)
    scope.stop()
  })

  it('resets to grid limits when layout changes and results are reset', async () => {
    const scope = effectScope()
    const projects = ref(Array.from({ length: 200 }, (_, index) => project(index + 1)))
    const layoutMode = ref<'list' | 'grid'>('list')
    const virtualScroll = scope.run(() => useVirtualScroll(projects, layoutMode))!

    layoutMode.value = 'grid'
    virtualScroll.resetRenderedProjects()
    await nextTick()

    expect(virtualScroll.renderedProjects.value).toHaveLength(72)
    virtualScroll.showMoreProjects()
    expect(virtualScroll.renderedProjects.value).toHaveLength(120)
    scope.stop()
  })

  it('uses grid initial limit when mounted in grid layout', () => {
    const scope = effectScope()
    const projects = ref(Array.from({ length: 200 }, (_, index) => project(index + 1)))
    const layoutMode = ref<'list' | 'grid'>('grid')
    const virtualScroll = scope.run(() => useVirtualScroll(projects, layoutMode))!

    expect(virtualScroll.renderedProjects.value).toHaveLength(72)
    scope.stop()
  })

  it('expands the rendered range enough to include a requested project', async () => {
    const scope = effectScope()
    const projects = ref(Array.from({ length: 300 }, (_, index) => project(index + 1)))
    const layoutMode = ref<'list' | 'grid'>('grid')
    const virtualScroll = scope.run(() => useVirtualScroll(projects, layoutMode))!

    await virtualScroll.ensureProjectRendered(projects.value[150])

    expect(virtualScroll.renderedProjects.value.at(-1)?.appendTime).toBe(198)
    scope.stop()
  })

  it('renders all remaining projects when IntersectionObserver is unavailable', () => {
    class FakeHTMLElement {}
    vi.stubGlobal('HTMLElement', FakeHTMLElement)

    const scope = effectScope()
    const projects = ref(Array.from({ length: 180 }, (_, index) => project(index + 1)))
    const layoutMode = ref<'list' | 'grid'>('list')
    const virtualScroll = scope.run(() => useVirtualScroll(projects, layoutMode))!

    virtualScroll.setLoadMoreSentinelRef(new FakeHTMLElement())

    expect(virtualScroll.renderedProjects.value).toHaveLength(180)
    expect(virtualScroll.hasMoreProjects.value).toBe(false)
    scope.stop()
  })
})
