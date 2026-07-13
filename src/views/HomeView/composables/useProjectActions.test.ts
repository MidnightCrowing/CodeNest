import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { showToast } from '~/components/ui/toast'
import type { ViewEnum } from '~/constants/appEnums'
import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { useSettingsStore } from '~/stores/settingsStore'

import { useProjectActions } from './useProjectActions'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
    }),
  }
})

vi.mock('~/components/LanguagePop/LanguagePopProvider', () => ({
  showPop: vi.fn(),
}))

vi.mock('~/components/RemoveProjectDialog', () => ({
  showRemoveDialog: vi.fn(),
}))

vi.mock('~/components/ui/toast', () => ({
  showToast: vi.fn(),
}))

vi.mock('~/views/ProjectEditorView', () => ({
  initializeNewProjectState: vi.fn(),
  initializeUpdateProjectState: vi.fn(),
}))

vi.mock('~/views/SettingsView', () => ({
  activatedPage: { value: null },
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
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    ...overrides,
  }
}

function createOpenState() {
  return {
    clearProjectFromMaps: vi.fn(),
    clearProjectOpening: vi.fn(),
    clearTerminalOpening: vi.fn(),
    finishProjectOpening: vi.fn(),
    finishTerminalOpening: vi.fn(),
    isProjectOpening: vi.fn(() => false),
    isTerminalOpening: vi.fn(() => false),
    markProjectOpening: vi.fn(),
    markTerminalOpening: vi.fn(),
  }
}

function createActions() {
  return useProjectActions({
    deleteProjectRefs: vi.fn(),
    navigateFromHome: vi.fn((_view: ViewEnum) => {}),
    openState: createOpenState(),
  })
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useProjectActions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(async () => {}),
      },
    })
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      api: {
        loadData: vi.fn(),
        saveData: vi.fn(async () => ({ success: true })),
        openProject: vi.fn(async () => {}),
        openRemoteProject: vi.fn(async () => {}),
        openInTerminal: vi.fn(async () => {}),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('copies a project path and clears copy feedback after the timeout', async () => {
    const actions = createActions()

    await actions.copyProjectPath(project())

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('E:\\Projects\\CodeNest')
    expect(actions.copyFeedback.value[1]).toBe('success')

    vi.advanceTimersByTime(1400)
    expect(actions.copyFeedback.value[1]).toBeUndefined()
  })

  it('copies terminal commands with Windows PowerShell quoting', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.codeEditorsPath[CodeEditorEnum.Neovim] = 'nvim {project}'
    settingsStore.codeEditorsOpenInTerminal[CodeEditorEnum.Neovim] = true
    const actions = createActions()

    actions.handleProjectMenuSelect(project({
      path: 'E:\\Projects\\Bob\'s App',
      defaultOpen: CodeEditorEnum.Neovim,
    }), 'copy-terminal-command')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Set-Location -LiteralPath \'E:\\Projects\\Bob\'\'s App\'; nvim \'E:\\Projects\\Bob\'\'s App\'',
    )
    expect(actions.copyFeedback.value[1]).toBe('success')
  })

  it('shows a settings prompt when opening with a missing editor command', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.codeEditorsPath[CodeEditorEnum.VisualStudioCode] = ''
    const actions = createActions()

    await actions.openProject(project())

    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      action: expect.objectContaining({ label: 'no_ide_path_dialog.set' }),
      description: 'no_ide_path_dialog.dialog_desc',
      title: 'no_ide_path_dialog.dialog_title',
      tone: 'warning',
    }))
    expect(window.api.openProject).not.toHaveBeenCalled()
  })
})
