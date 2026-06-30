import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeColorEnum } from '~/constants/appEnums'
import { CodeEditorEnum, editorCommandKeys } from '~/constants/codeEditor'
import { useSettingsStore } from '~/stores/settingsStore'

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      setTimeout,
      clearTimeout,
      api: {
        loadData: vi.fn(),
        saveData: vi.fn(async () => ({ success: true })),
        loadWebDavPassword: vi.fn(async () => null),
        saveWebDavPassword: vi.fn(),
        deleteWebDavPassword: vi.fn(),
        detectEditorCommand: vi.fn(async () => null),
      },
    })
  })

  it('migrates the old saved blue theme-color default to contrast', async () => {
    vi.mocked(window.api.loadData).mockResolvedValue({
      success: true,
      data: JSON.stringify({
        themeColor: ThemeColorEnum.Blue,
        autoDetectedEditorCommands: true,
        editorInitialCommandsVersion: 1,
      }),
    })

    const settingsStore = useSettingsStore()
    await settingsStore.loadSettings()

    expect(settingsStore.themeColor).toBe(ThemeColorEnum.Contrast)
    expect(window.api.saveData).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining(`"themeColor":"${ThemeColorEnum.Contrast}"`),
    )
    expect(window.api.saveData).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"themeColorDefaultVersion":1'),
    )
  })

  it('keeps blue when the setting was saved after the default migration', async () => {
    vi.mocked(window.api.loadData).mockResolvedValue({
      success: true,
      data: JSON.stringify({
        themeColor: ThemeColorEnum.Blue,
        themeColorDefaultVersion: 1,
        autoDetectedEditorCommands: true,
        editorInitialCommandsVersion: 1,
      }),
    })

    const settingsStore = useSettingsStore()
    await settingsStore.loadSettings()

    expect(settingsStore.themeColor).toBe(ThemeColorEnum.Blue)
    expect(window.api.saveData).not.toHaveBeenCalled()
  })

  it('keeps at least one editor visible', () => {
    const settingsStore = useSettingsStore()

    for (const editor of editorCommandKeys) {
      if (editor !== CodeEditorEnum.VisualStudioCode)
        settingsStore.setEditorVisible(editor, false)
    }
    settingsStore.setEditorVisible(CodeEditorEnum.VisualStudioCode, false)

    expect(settingsStore.isEditorVisible(CodeEditorEnum.VisualStudioCode)).toBe(true)
    expect(settingsStore.visibleCodeEditorOrder).toEqual([CodeEditorEnum.VisualStudioCode])
  })

  it('falls back scanner specified editor when the selected editor is hidden', () => {
    const settingsStore = useSettingsStore()
    settingsStore.scanner.editor = CodeEditorEnum.Cursor

    settingsStore.setEditorVisible(CodeEditorEnum.Cursor, false)

    expect(settingsStore.scanner.editor).toBe(CodeEditorEnum.Trae)
  })

  it('resolves automatic editor choices to visible editors only', () => {
    const settingsStore = useSettingsStore()
    settingsStore.setEditorVisible(CodeEditorEnum.Cursor, false)

    expect(settingsStore.resolveVisibleEditor(
      CodeEditorEnum.Cursor,
      CodeEditorEnum.VisualStudioCode,
    )).toBe(CodeEditorEnum.VisualStudioCode)
    expect(settingsStore.visibleEditorCommandOptions.some(option => option.key === CodeEditorEnum.Cursor)).toBe(false)
  })
})
