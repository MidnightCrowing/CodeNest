import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { useProjectOpenState } from './useProjectOpenState'

function project(appendTime: number): LocalProject {
  return {
    appendTime,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: '',
    kind: ProjectKind.MINE,
    mainLang: 'TypeScript',
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
  }
}

describe('useProjectOpenState', () => {
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

  it('keeps project opening visible for the minimum duration', async () => {
    const scope = effectScope()
    const openState = scope.run(() => useProjectOpenState())!
    const currentProject = project(1)

    openState.markProjectOpening(currentProject.appendTime)
    expect(openState.isProjectOpening(currentProject)).toBe(true)

    openState.finishProjectOpening(currentProject.appendTime)
    vi.advanceTimersByTime(2199)
    await nextTick()
    expect(openState.isProjectOpening(currentProject)).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(openState.isProjectOpening(currentProject)).toBe(false)
    scope.stop()
  })

  it('keeps terminal opening visible for the minimum duration', async () => {
    const scope = effectScope()
    const openState = scope.run(() => useProjectOpenState())!
    const currentProject = project(1)

    openState.markTerminalOpening(currentProject.appendTime)
    expect(openState.isTerminalOpening(currentProject)).toBe(true)

    openState.finishTerminalOpening(currentProject.appendTime)
    vi.advanceTimersByTime(799)
    await nextTick()
    expect(openState.isTerminalOpening(currentProject)).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(openState.isTerminalOpening(currentProject)).toBe(false)
    scope.stop()
  })

  it('clears all opening state for a removed project', () => {
    const scope = effectScope()
    const openState = scope.run(() => useProjectOpenState())!
    const currentProject = project(1)

    openState.markProjectOpening(currentProject.appendTime)
    openState.markTerminalOpening(currentProject.appendTime)
    openState.clearProjectFromMaps(currentProject.appendTime)

    expect(openState.isProjectOpening(currentProject)).toBe(false)
    expect(openState.isTerminalOpening(currentProject)).toBe(false)
    scope.stop()
  })
})
