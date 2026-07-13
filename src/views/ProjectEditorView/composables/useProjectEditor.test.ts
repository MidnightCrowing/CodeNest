import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import { ViewEnum } from '~/constants/appEnums'
import { CodeEditorEnum } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'

import {
  initializeNewProjectState,
  initializeUpdateProjectState,
  localProjectItem,
} from '../ProjectEditorViewProvider'
import { useProjectEditor } from './useProjectEditor'

const activatedViewRef = vi.hoisted(() => ({
  value: 'project-editor' as string,
}))

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>()
  return {
    ...actual,
    inject: (key: string | symbol, defaultValue?: unknown) => {
      if (key === 'activatedView')
        return activatedViewRef
      return actual.inject(key as never, defaultValue as never)
    },
  }
})

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
    }),
  }
})

vi.mock('~/services/languageAnalyzer', () => ({
  LanguageAnalyzer: class {
    langGroup = [{ text: 'TypeScript', color: '#3178c6', percentage: 100 }]
    mainLang = 'TypeScript'
    async analyze() {
      return true
    }
  },
}))

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

function project(overrides: Partial<LocalProject> = {}): LocalProject {
  return {
    appendTime: 1,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: '',
    kind: ProjectKind.MINE,
    mainLang: 'TypeScript',
    langGroup: [{ text: 'TypeScript', color: '#3178c6', percentage: 100 }],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    ...overrides,
  }
}

describe('useProjectEditor', () => {
  const scopes: Array<ReturnType<typeof effectScope>> = []

  function createEditor() {
    const scope = effectScope(true)
    const editor = scope.run(() => useProjectEditor())!
    scopes.push(scope)
    return editor
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    activatedViewRef.value = ViewEnum.ProjectEditor
    initializeNewProjectState()
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      api: {
        loadData: vi.fn(),
        saveData: vi.fn(async () => ({ success: true })),
        openFolderDialog: vi.fn(async () => null),
        getLanguageColor: vi.fn(async () => '#3178c6'),
        detectProjectGitMetadata: vi.fn(async () => ({ kind: ProjectKind.MINE })),
        readProjectLicense: vi.fn(async () => ({ success: false })),
        checkPathExistence: vi.fn(async () => ({ exists: true })),
      },
    })
  })

  afterEach(() => {
    while (scopes.length)
      scopes.pop()?.stop()
    vi.unstubAllGlobals()
  })

  it('computes canSave for local and remote requirements', () => {
    initializeNewProjectState({
      path: 'E:\\Projects\\CodeNest',
      name: 'CodeNest',
      mainLang: 'TypeScript',
      defaultOpen: CodeEditorEnum.VisualStudioCode,
    })
    const editor = createEditor()
    expect(editor.canSave.value).toBe(true)

    localProjectItem.value.mainLang = null
    expect(editor.canSave.value).toBe(false)
    scopes.pop()?.stop()

    initializeNewProjectState({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/home/code',
      name: 'CodeNest',
      defaultOpen: CodeEditorEnum.VisualStudioCode,
    })
    const remoteEditor = createEditor()
    expect(remoteEditor.canSave.value).toBe(true)

    localProjectItem.value.remoteHost = null
    expect(remoteEditor.canSave.value).toBe(false)
  })

  it('builds effective remote paths and repository folder names', () => {
    initializeNewProjectState({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/home/user/CodeNest',
    })
    const editor = createEditor()
    expect(editor.effectivePath.value).toBe('devbox:/home/user/CodeNest')
    expect(editor.repositoryFolderName.value).toBe('CodeNest')

    localProjectItem.value.remotePath = null
    expect(editor.effectivePath.value).toBe('')
  })

  it('fills project name from the repository folder', () => {
    initializeNewProjectState({
      path: 'E:\\Projects\\CodeNest',
    })
    const editor = createEditor()
    editor.fillProjectName()
    expect(localProjectItem.value.name).toBe('CodeNest')
  })

  it('detects duplicate local paths against the projects store', async () => {
    const projectsStore = useProjectsStore()
    await projectsStore.addProject(project({ path: 'E:\\Projects\\Existing' }), true)

    initializeNewProjectState({
      path: 'E:\\Projects\\Existing',
      name: 'Existing',
      mainLang: 'TypeScript',
      defaultOpen: CodeEditorEnum.VisualStudioCode,
    })
    const editor = createEditor()
    expect(editor.duplicatePath.value).toBe(true)
  })

  it('excludes the original path when updating an existing project', async () => {
    const projectsStore = useProjectsStore()
    await projectsStore.addProject(project({ path: 'E:\\Projects\\Existing' }), true)

    initializeUpdateProjectState(project({ path: 'E:\\Projects\\Existing' }))
    const editor = createEditor()
    expect(editor.duplicatePath.value).toBe(false)
  })

  it('switches between local and remote modes and clears incompatible fields', () => {
    initializeNewProjectState({
      path: 'E:\\Projects\\CodeNest',
      defaultOpen: CodeEditorEnum.Neovim,
    })
    const editor = createEditor()

    editor.setProjectMode('remote')
    expect(localProjectItem.value.isRemote).toBe(true)
    expect(localProjectItem.value.path).toBeNull()
    expect(localProjectItem.value.defaultOpen).toBeNull()

    localProjectItem.value.remoteHost = 'devbox'
    localProjectItem.value.remotePath = '/tmp/app'
    localProjectItem.value.defaultOpen = CodeEditorEnum.VisualStudioCode
    editor.setProjectMode('local')
    expect(localProjectItem.value.isRemote).toBe(false)
    expect(localProjectItem.value.remoteHost).toBeNull()
    expect(localProjectItem.value.remotePath).toBeNull()
  })

  it('marks fields invalid only after they have been touched', () => {
    initializeNewProjectState()
    const editor = createEditor()

    expect(editor.fieldInvalid('name')).toBe(false)
    editor.markTouched('name')
    expect(editor.fieldInvalid('name')).toBe(true)

    localProjectItem.value.name = 'CodeNest'
    expect(editor.fieldInvalid('name')).toBe(false)
  })

  it('saves a new local project through the projects store', async () => {
    const projectsStore = useProjectsStore()
    const addSpy = vi.spyOn(projectsStore, 'addProject')

    initializeNewProjectState({
      path: 'E:\\Projects\\CodeNest',
      name: 'CodeNest',
      mainLang: 'TypeScript',
      defaultOpen: CodeEditorEnum.VisualStudioCode,
      license: LicenseEnum.MIT,
    })
    const editor = createEditor()
    await editor.saveProject()

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'E:\\Projects\\CodeNest',
        name: 'CodeNest',
        mainLang: 'TypeScript',
        license: LicenseEnum.MIT,
      }),
      true,
    )
    expect(activatedViewRef.value).toBe(ViewEnum.Home)
  })

  it('saves remote projects with host:path and omits NONE licenses', async () => {
    const projectsStore = useProjectsStore()
    const addSpy = vi.spyOn(projectsStore, 'addProject')

    initializeNewProjectState({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/home/code',
      name: 'RemoteNest',
      defaultOpen: CodeEditorEnum.VisualStudioCode,
      kind: ProjectKind.CLONE,
      fromUrl: 'https://github.com/MidnightCrowing/CodeNest',
      fromName: 'MidnightCrowing/CodeNest',
      license: LicenseEnum.NONE,
    })
    const editor = createEditor()
    await editor.saveProject()

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'devbox:/home/code',
        isRemote: true,
        remoteHost: 'devbox',
        remotePath: '/home/code',
        fromUrl: 'https://github.com/MidnightCrowing/CodeNest',
        fromName: 'MidnightCrowing/CodeNest',
      }),
      true,
    )
    const saved = addSpy.mock.calls[0]?.[0] as LocalProject
    expect(saved.license).toBeUndefined()
  })

  it('does not save when required fields are missing', async () => {
    const projectsStore = useProjectsStore()
    const addSpy = vi.spyOn(projectsStore, 'addProject')

    initializeNewProjectState({
      path: 'E:\\Projects\\CodeNest',
    })
    const editor = createEditor()
    await editor.saveProject()

    expect(addSpy).not.toHaveBeenCalled()
    expect(editor.fieldInvalid('name')).toBe(true)
  })

  it('fills source name suggestions from GitHub URLs', () => {
    initializeNewProjectState({
      fromUrl: 'https://github.com/MidnightCrowing/CodeNest.git',
    })
    const editor = createEditor()
    expect(editor.sourceSuggestion.value).toBe('MidnightCrowing/CodeNest')
    editor.fillSourceName()
    expect(localProjectItem.value.fromName).toBe('MidnightCrowing/CodeNest')
  })

  it('closes the editor and resets provider state', () => {
    initializeUpdateProjectState(project())
    const editor = createEditor()
    editor.closeEditor()

    expect(localProjectItem.value.appendTime).toBeNull()
    expect(activatedViewRef.value).toBe(ViewEnum.Home)
  })
})
