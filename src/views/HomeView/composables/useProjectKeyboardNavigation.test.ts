import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { showRemoveDialog } from '~/components/RemoveProjectDialog'
import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { useProjectKeyboardNavigation } from './useProjectKeyboardNavigation'

vi.mock('~/components/RemoveProjectDialog', () => ({
  showRemoveDialog: vi.fn(),
}))

class FakeHTMLElement {
  style: Record<string, string> = {}
  dataset: Record<string, string> = {}
  disabled = false
  rect = { left: 0, top: 0, width: 120, height: 48, right: 120, bottom: 48, x: 0, y: 0, toJSON: () => ({}) }
  children: FakeHTMLElement[] = []
  focus = vi.fn()
  scrollIntoView = vi.fn()
  dispatchEvent = vi.fn()

  getBoundingClientRect() {
    return this.rect
  }

  getClientRects() {
    return this.disabled ? [] : [this.rect]
  }

  querySelectorAll(selector: string) {
    if (selector === '[data-project-action]')
      return this.children as unknown as NodeListOf<HTMLButtonElement>
    return [] as unknown as NodeListOf<Element>
  }

  closest(selector: string) {
    if (selector.includes('data-project-action') && this.dataset.projectAction)
      return this as unknown as HTMLButtonElement
    return null
  }
}

function project(appendTime: number, overrides: Partial<LocalProject> = {}): LocalProject {
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
    ...overrides,
  }
}

function keyEvent(
  key: string,
  overrides: Partial<KeyboardEvent> & Record<string, unknown> = {},
) {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    defaultPrevented: false,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    target: null,
    currentTarget: null,
    ...overrides,
  } as unknown as KeyboardEvent
}

describe('useProjectKeyboardNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('HTMLElement', FakeHTMLElement)
    vi.stubGlobal('MouseEvent', class {
      bubbles: boolean
      cancelable: boolean
      clientX: number
      clientY: number
      constructor(_type: string, init: Record<string, unknown> = {}) {
        this.bubbles = !!init.bubbles
        this.cancelable = !!init.cancelable
        this.clientX = Number(init.clientX || 0)
        this.clientY = Number(init.clientY || 0)
      }
    })
  })

  function createNavigation(overrides: {
    projects?: LocalProject[]
    layoutMode?: 'list' | 'grid'
  } = {}) {
    const projects = overrides.projects || [
      project(1),
      project(2),
      project(3, { isExists: false }),
      project(4),
    ]
    const filteredProjects = ref(projects)
    const layoutMode = ref<'list' | 'grid'>(overrides.layoutMode || 'list')
    const projectItemRefs = new Map<number, HTMLElement>()
    const projectActionRefs = new Map<number, HTMLElement>()

    for (const item of projects) {
      const el = new FakeHTMLElement()
      el.rect = {
        ...el.rect,
        left: item.appendTime * 140,
        top: item.appendTime * 60,
        right: item.appendTime * 140 + 120,
        bottom: item.appendTime * 60 + 48,
      }
      projectItemRefs.set(item.appendTime, el as unknown as HTMLElement)
    }

    const openProject = vi.fn(async () => {})
    const editProject = vi.fn()
    const copyProjectPath = vi.fn(async () => {})
    const ensureProjectRendered = vi.fn(async () => {})

    const navigation = useProjectKeyboardNavigation({
      filteredProjects,
      layoutMode,
      refs: { projectItemRefs, projectActionRefs },
      ensureProjectRendered,
      openProject,
      editProject,
      copyProjectPath,
    })

    return {
      navigation,
      projects,
      filteredProjects,
      layoutMode,
      projectItemRefs,
      projectActionRefs,
      openProject,
      editProject,
      copyProjectPath,
      ensureProjectRendered,
    }
  }

  it('disables explorer for remote projects and existence-gated actions for missing projects', () => {
    const { navigation } = createNavigation()
    const remote = project(10, { isRemote: true, isExists: true })
    const missing = project(11, { isExists: false })

    expect(navigation.isProjectActionDisabled(remote, 'explorer')).toBe(true)
    expect(navigation.isProjectActionDisabled(remote, 'open')).toBe(false)
    expect(navigation.isProjectActionDisabled(missing, 'open')).toBe(true)
    expect(navigation.isProjectActionDisabled(missing, 'explorer')).toBe(true)
    expect(navigation.isProjectActionDisabled(missing, 'terminal')).toBe(true)
    expect(navigation.isProjectActionDisabled(missing, 'copy')).toBe(false)
  })

  it('marks only the first enabled action as tabbable', () => {
    const { navigation } = createNavigation()
    const missing = project(11, { isExists: false })

    expect(navigation.actionButtonTabIndex(missing, 'open')).toBe(-1)
    expect(navigation.actionButtonTabIndex(missing, 'copy')).toBe(0)
    expect(navigation.actionButtonTabIndex(missing, 'more')).toBe(-1)
  })

  it('opens the project with Enter or Space when the container itself is focused', async () => {
    const { navigation, projects, openProject } = createNavigation()
    const current = projects[0]
    const currentTarget = new FakeHTMLElement()

    navigation.handleProjectContainerKeydown(current, keyEvent('Enter', {
      target: currentTarget,
      currentTarget,
    }))
    navigation.handleProjectContainerKeydown(current, keyEvent(' ', {
      target: currentTarget,
      currentTarget,
    }))

    expect(openProject).toHaveBeenCalledTimes(2)
    expect(openProject).toHaveBeenCalledWith(current)
  })

  it('ignores container keydown events from nested targets', () => {
    const { navigation, projects, openProject } = createNavigation()
    const current = projects[0]

    navigation.handleProjectContainerKeydown(current, keyEvent('Enter', {
      target: new FakeHTMLElement(),
      currentTarget: new FakeHTMLElement(),
    }))

    expect(openProject).not.toHaveBeenCalled()
  })

  it('moves focus linearly in list mode and skips missing projects', async () => {
    const { navigation, projects, projectItemRefs, ensureProjectRendered } = createNavigation()
    const current = projects[0]
    const currentTarget = projectItemRefs.get(current.appendTime)

    navigation.handleProjectContainerKeydown(current, keyEvent('ArrowDown', {
      target: currentTarget,
      currentTarget,
    }))

    // focusProject is async; wait for ensure/focus side effects.
    await Promise.resolve()
    await Promise.resolve()
    expect(ensureProjectRendered).toHaveBeenCalledWith(projects[1])
    expect((projectItemRefs.get(2) as unknown as FakeHTMLElement).focus).toHaveBeenCalled()
  })

  it('moves focus with Home and End to existing projects only', async () => {
    const { navigation, projects, projectItemRefs } = createNavigation()
    const current = projects[1]
    const currentTarget = projectItemRefs.get(current.appendTime)

    navigation.handleProjectContainerKeydown(current, keyEvent('Home', {
      target: currentTarget,
      currentTarget,
    }))
    await Promise.resolve()
    await Promise.resolve()
    expect((projectItemRefs.get(1) as unknown as FakeHTMLElement).focus).toHaveBeenCalled()

    navigation.handleProjectContainerKeydown(current, keyEvent('End', {
      target: currentTarget,
      currentTarget,
    }))
    await Promise.resolve()
    await Promise.resolve()
    expect((projectItemRefs.get(4) as unknown as FakeHTMLElement).focus).toHaveBeenCalled()
  })

  it('handles edit, copy, and remove shortcuts', () => {
    const { navigation, projects, editProject, copyProjectPath } = createNavigation()
    const current = projects[0]
    const currentTarget = new FakeHTMLElement()

    navigation.handleProjectContainerKeydown(current, keyEvent('i', {
      ctrlKey: true,
      target: currentTarget,
      currentTarget,
    }))
    navigation.handleProjectContainerKeydown(current, keyEvent('c', {
      metaKey: true,
      target: currentTarget,
      currentTarget,
    }))
    navigation.handleProjectContainerKeydown(current, keyEvent('Delete', {
      target: currentTarget,
      currentTarget,
    }))

    expect(editProject).toHaveBeenCalledWith(current)
    expect(copyProjectPath).toHaveBeenCalledWith(current)
    expect(showRemoveDialog).toHaveBeenCalledWith(current)
  })

  it('supports left/right navigation only in grid mode', async () => {
    const list = createNavigation({ layoutMode: 'list' })
    const grid = createNavigation({ layoutMode: 'grid' })
    const listCurrent = list.projects[0]
    const gridCurrent = grid.projects[0]
    const listTarget = list.projectItemRefs.get(listCurrent.appendTime)
    const gridTarget = grid.projectItemRefs.get(gridCurrent.appendTime)

    list.navigation.handleProjectContainerKeydown(listCurrent, keyEvent('ArrowRight', {
      target: listTarget,
      currentTarget: listTarget,
    }))
    expect(list.ensureProjectRendered).not.toHaveBeenCalled()

    grid.navigation.handleProjectContainerKeydown(gridCurrent, keyEvent('ArrowRight', {
      target: gridTarget,
      currentTarget: gridTarget,
    }))
    expect(grid.ensureProjectRendered).toHaveBeenCalled()
  })

  it('moves toolbar action focus with arrow keys', () => {
    const { navigation, projects, projectActionRefs } = createNavigation()
    const current = projects[0]
    const toolbar = new FakeHTMLElement()
    const open = new FakeHTMLElement()
    open.dataset.projectAction = 'open'
    const more = new FakeHTMLElement()
    more.dataset.projectAction = 'more'
    more.rect = { ...more.rect, left: 40 }
    toolbar.children = [open, more]
    projectActionRefs.set(current.appendTime, toolbar as unknown as HTMLElement)

    navigation.handleProjectActionsKeydown(current, keyEvent('ArrowRight', {
      target: open,
      currentTarget: toolbar,
    }))

    expect(more.focus).toHaveBeenCalled()
  })
})
