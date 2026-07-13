import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import {
  hideRemoveDialog,
  isDialogVisible,
  playRemoveAnimation,
  projectToRemove,
  setRemoveAnimationCallback,
  showRemoveDialog,
} from './RemoveProjectDialogProvider'

function project(): LocalProject {
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
  }
}

describe('removeProjectDialogProvider', () => {
  beforeEach(() => {
    hideRemoveDialog()
    setRemoveAnimationCallback(null)
  })

  it('shows and hides the selected project', () => {
    const currentProject = project()

    showRemoveDialog(currentProject)

    expect(isDialogVisible.value).toBe(true)
    expect(projectToRemove.value).toEqual(currentProject)

    hideRemoveDialog()

    expect(isDialogVisible.value).toBe(false)
    expect(projectToRemove.value).toBeNull()
  })

  it('runs the configured remove animation callback', async () => {
    const callback = vi.fn(async () => {})

    setRemoveAnimationCallback(callback)
    await playRemoveAnimation(1)

    expect(callback).toHaveBeenCalledWith(1)

    setRemoveAnimationCallback(null)
    await expect(playRemoveAnimation(1)).resolves.toBeUndefined()
  })
})
