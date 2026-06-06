import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'

describe('projectsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('navigator', { userAgent: 'Windows' })
  })

  it('detects duplicate Windows paths with slash and case differences', () => {
    const projectsStore = useProjectsStore()
    projectsStore.projects.push({
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
    })

    expect(projectsStore.checkPathExistenceInProjects('e:/projects/codenest/')).toBe(true)
  })

  it('honors excluded paths after normalization', () => {
    const projectsStore = useProjectsStore()
    projectsStore.projects.push({
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
    })

    expect(projectsStore.checkPathExistenceInProjects(
      'e:/projects/codenest/',
      ['E:/Projects/CodeNest'],
    )).toBe(false)
  })
})
