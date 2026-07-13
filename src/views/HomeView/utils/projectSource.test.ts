import { describe, expect, it } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { projectSourcePrefix, projectSourceTitle } from './projectSource'

function project(overrides: Partial<LocalProject> = {}): LocalProject {
  return {
    appendTime: 1,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: '',
    kind: ProjectKind.FORK,
    mainLang: 'TypeScript',
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    ...overrides,
  }
}

describe('home projectSource', () => {
  it('uses different prefixes for forked and cloned projects', () => {
    const t = (key: string) => key

    expect(projectSourcePrefix(project({ kind: ProjectKind.FORK }), t)).toBe('app.home.source.forked_from')
    expect(projectSourcePrefix(project({ kind: ProjectKind.CLONE }), t)).toBe('app.home.source.cloned_from')
  })

  it('combines source name and URL when both are available and different', () => {
    const t = (key: string) => key

    expect(projectSourceTitle(project({
      fromName: 'MidnightCrowing/CodeNest',
      fromUrl: 'https://github.com/MidnightCrowing/CodeNest',
    }), t)).toBe('app.home.source.forked_from MidnightCrowing/CodeNest\nhttps://github.com/MidnightCrowing/CodeNest')
  })

  it('falls back to the URL-derived source name when no display name is provided', () => {
    const t = (key: string) => key

    expect(projectSourceTitle(project({
      fromUrl: 'https://github.com/MidnightCrowing/CodeNest.git',
    }), t)).toBe('app.home.source.forked_from MidnightCrowing/CodeNest\nhttps://github.com/MidnightCrowing/CodeNest.git')
  })

  it('returns no title for projects without source metadata', () => {
    const t = (key: string) => key

    expect(projectSourceTitle(project({ fromName: '', fromUrl: '' }), t)).toBe('')
    expect(projectSourceTitle(project({ kind: ProjectKind.MINE, fromName: 'ignored', fromUrl: 'https://example.com/repo' }), t)).toBe('')
  })
})
