import { describe, expect, it } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import {
  extractGithubRepositoryName,
  hasProjectSource,
  normalizeProjectSourceExternalUrl,
  projectSourceExternalUrl,
  projectSourceName,
  sourceNameFromUrl,
} from './projectSource'

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

describe('projectSource utilities', () => {
  it('extracts GitHub owner and repository from common URL forms', () => {
    expect(extractGithubRepositoryName('https://github.com/MidnightCrowing/CodeNest.git')).toBe('MidnightCrowing/CodeNest')
    expect(extractGithubRepositoryName('git@github.com:MidnightCrowing/CodeNest.git')).toBe('MidnightCrowing/CodeNest')
  })

  it('normalizes source URLs for opening externally', () => {
    expect(normalizeProjectSourceExternalUrl('github.com/MidnightCrowing/CodeNest.git')).toBe('https://github.com/MidnightCrowing/CodeNest')
    expect(normalizeProjectSourceExternalUrl('example.com/team/repo')).toBe('https://example.com/team/repo')
    expect(normalizeProjectSourceExternalUrl('https://gitlab.com/team/repo')).toBe('https://gitlab.com/team/repo')
  })

  it('derives readable source names from URLs', () => {
    expect(sourceNameFromUrl('https://github.com/MidnightCrowing/CodeNest.git')).toBe('MidnightCrowing/CodeNest')
    expect(sourceNameFromUrl('https://gitlab.com/team/repo')).toBe('team/repo')
    expect(sourceNameFromUrl('not a url')).toBe('not a url')
  })

  it('only exposes source metadata for cloned or forked projects', () => {
    const fork = project({ fromUrl: 'https://github.com/MidnightCrowing/CodeNest.git' })
    const mine = project({
      kind: ProjectKind.MINE,
      fromUrl: 'https://github.com/MidnightCrowing/CodeNest.git',
      fromName: 'ignored/source',
    })

    expect(projectSourceName(fork)).toBe('MidnightCrowing/CodeNest')
    expect(projectSourceExternalUrl(fork)).toBe('https://github.com/MidnightCrowing/CodeNest')
    expect(hasProjectSource(fork)).toBe(true)
    expect(projectSourceName(mine)).toBe('')
    expect(projectSourceExternalUrl(mine)).toBe('')
    expect(hasProjectSource(mine)).toBe(false)
  })
})
