import { describe, expect, it } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { canDeleteProjectFiles } from './projectCapabilities'

function project(overrides: Partial<LocalProject> = {}): LocalProject {
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

describe('canDeleteProjectFiles', () => {
  it('allows deleting files of an existing local project', () => {
    expect(canDeleteProjectFiles(project())).toBe(true)
    expect(canDeleteProjectFiles(project({ isTemporary: true }))).toBe(true)
  })

  it('rejects projects whose local path is gone', () => {
    expect(canDeleteProjectFiles(project({ isExists: false }))).toBe(false)
  })

  it('rejects remote projects because they have no local files', () => {
    expect(canDeleteProjectFiles(project({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/home/me/app',
    }))).toBe(false)
  })
})
