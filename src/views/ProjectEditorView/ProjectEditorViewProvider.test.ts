import { beforeEach, describe, expect, it } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import {
  initializeNewProjectState,
  initializeUpdateProjectState,
  isUpdateProject,
  localProjectItem,
} from './ProjectEditorViewProvider'

function project(overrides: Partial<LocalProject> = {}): LocalProject {
  return {
    appendTime: 1,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: 'Apps',
    kind: ProjectKind.FORK,
    fromName: 'MidnightCrowing/CodeNest',
    fromUrl: 'https://github.com/MidnightCrowing/CodeNest',
    mainLang: 'TypeScript',
    langGroup: [{ color: '#3178c6', percentage: 100, text: 'TypeScript' }],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    license: LicenseEnum.MIT,
    ...overrides,
  }
}

describe('projectEditorViewProvider', () => {
  beforeEach(() => {
    initializeNewProjectState()
  })

  it('initializes new project state with defaults and optional overrides', () => {
    initializeNewProjectState({
      group: 'Work',
      isRemote: true,
      remoteHost: 'devbox',
    })

    expect(isUpdateProject.value).toBe(false)
    expect(localProjectItem.value).toMatchObject({
      appendTime: null,
      group: 'Work',
      isRemote: true,
      kind: ProjectKind.MINE,
      license: LicenseEnum.NONE,
      remoteHost: 'devbox',
    })
  })

  it('initializes update state from an existing project', () => {
    initializeUpdateProjectState(project())

    expect(isUpdateProject.value).toBe(true)
    expect(localProjectItem.value).toMatchObject({
      appendTime: 1,
      defaultOpen: CodeEditorEnum.VisualStudioCode,
      fromName: 'MidnightCrowing/CodeNest',
      kind: ProjectKind.FORK,
      license: LicenseEnum.MIT,
      name: 'CodeNest',
    })
  })

  it('resets stale update fields when switching back to a new project', () => {
    initializeUpdateProjectState(project())
    initializeNewProjectState()

    expect(isUpdateProject.value).toBe(false)
    expect(localProjectItem.value).toMatchObject({
      appendTime: null,
      defaultOpen: null,
      license: LicenseEnum.NONE,
      name: null,
    })
    expect(localProjectItem.value).not.toHaveProperty('fromName')
    expect(localProjectItem.value).not.toHaveProperty('fromUrl')
  })
})
