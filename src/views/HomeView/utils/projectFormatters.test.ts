import { describe, expect, it } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { editorIconClasses, editorLabel, formatLastOpened, kindClass } from './projectFormatters'

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

describe('home projectFormatters', () => {
  it('maps project kinds to CSS class names', () => {
    expect(kindClass(ProjectKind.MINE)).toBe('')
    expect(kindClass(ProjectKind.FORK)).toBe('kind-fork')
    expect(kindClass(ProjectKind.CLONE)).toBe('kind-clone')
  })

  it('builds editor icon classes from editor metadata', () => {
    expect(editorIconClasses(null)).toEqual([])
    expect(editorIconClasses(CodeEditorEnum.Cursor)).toEqual([
      'ide-icon',
      'i-custom:cursor',
      { 'monochrome-editor-icon': true },
    ])
  })

  it('formats editor labels and missing last-opened values', () => {
    const t = (key: string) => `translated:${key}`

    expect(editorLabel(CodeEditorEnum.VisualStudioCode, t)).toBe('Visual Studio Code')
    expect(formatLastOpened(project(), 'en-US', t)).toBe('translated:app.home.table.never_opened')
    expect(formatLastOpened(project({ lastOpenedAt: Date.UTC(2026, 0, 2, 3, 4) }), 'en-US', t)).toContain('Jan')
  })
})
