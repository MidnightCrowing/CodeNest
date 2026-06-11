import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

describe('projectsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('navigator', {
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      api: {
        checkPathExistence: vi.fn(async () => ({ exists: true })),
        saveData: vi.fn(async () => ({ success: true })),
      },
    })
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

  it('preserves pinned state when updating project details', async () => {
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
      isPinned: true,
      isExists: true,
    })

    await projectsStore.updateProject(1, {
      appendTime: 1,
      path: 'E:\\Projects\\CodeNest',
      name: 'CodeNest Updated',
      group: '',
      kind: ProjectKind.MINE,
      mainLang: 'TypeScript',
      langGroup: [],
      defaultOpen: CodeEditorEnum.VisualStudioCode,
      isTemporary: false,
      isExists: true,
    })

    expect(projectsStore.projects[0].isPinned).toBe(true)
  })
})
