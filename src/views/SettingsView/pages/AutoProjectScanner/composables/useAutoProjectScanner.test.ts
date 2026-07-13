import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useSettingsStore } from '~/stores/settingsStore'

import { useAutoProjectScanner } from './useAutoProjectScanner'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string, params?: Record<string, string>) =>
        params ? `${key}:${JSON.stringify(params)}` : key,
    }),
  }
})

function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    clear: () => data.clear(),
  } as unknown as Storage
}

describe('useAutoProjectScanner', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      api: {
        loadData: vi.fn(),
        saveData: vi.fn(async () => ({ success: true })),
        deleteData: vi.fn(async () => ({ success: true })),
        openFolderDialog: vi.fn(async () => null),
        openFileDialog: vi.fn(async () => null),
        detectJetBrainsConfigRootPath: vi.fn(async () => null),
        detectRecentEditorStateDbPath: vi.fn(async () => null),
        detectCliHistoryRootPath: vi.fn(async () => null),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('adds project roots with de-duplication and sorting when roots are enabled', async () => {
    const settings = useSettingsStore()
    settings.scanner.rootsEnabled = true
    settings.scanner.roots = ['E:/Projects/B']
    vi.mocked(window.api.openFolderDialog).mockResolvedValue('E:/Projects/A')

    const scanner = useAutoProjectScanner()
    await scanner.addProjectRoot()

    expect(settings.scanner.roots).toEqual(['E:/Projects/A', 'E:/Projects/B'])
  })

  it('ignores addProjectRoot when roots scanning is disabled', async () => {
    const settings = useSettingsStore()
    settings.scanner.rootsEnabled = false
    vi.mocked(window.api.openFolderDialog).mockResolvedValue('E:/Projects/A')

    const scanner = useAutoProjectScanner()
    await scanner.addProjectRoot()

    expect(window.api.openFolderDialog).not.toHaveBeenCalled()
    expect(settings.scanner.roots).toEqual([])
  })

  it('removes a configured root path', () => {
    const settings = useSettingsStore()
    settings.scanner.roots = ['E:/Projects/A', 'E:/Projects/B']

    const scanner = useAutoProjectScanner()
    scanner.removeRoot('E:/Projects/A')

    expect(settings.scanner.roots).toEqual(['E:/Projects/B'])
  })

  it('gets and sets scanner source paths for vscode and cli rows via input handlers', () => {
    class FakeHTMLInputElement {
      value: string
      constructor(value: string) {
        this.value = value
      }
    }
    vi.stubGlobal('HTMLInputElement', FakeHTMLInputElement)

    const settings = useSettingsStore()
    const scanner = useAutoProjectScanner()
    const rows = scanner.scannerSourceRows.value
    const vscodeRow = rows.find(row => row.kind === 'vscode-history')
    const cliRow = rows.find(row => row.kind === 'cli-history')

    expect(vscodeRow).toBeTruthy()
    expect(cliRow).toBeTruthy()
    if (!vscodeRow || !cliRow)
      return

    scanner.handleScannerSourcePathInput(vscodeRow, {
      target: new FakeHTMLInputElement('C:/state.vscdb'),
    } as unknown as Event)
    scanner.handleScannerSourcePathInput(cliRow, {
      target: new FakeHTMLInputElement('C:/cli-history'),
    } as unknown as Event)

    // Non-input targets should be ignored.
    scanner.handleScannerSourcePathInput(vscodeRow, {
      target: { value: 'should-not-apply' },
    } as unknown as Event)

    expect(scanner.getScannerSourcePath(vscodeRow)).toBe('C:/state.vscdb')
    expect(scanner.getScannerSourcePath(cliRow)).toBe('C:/cli-history')
    expect(settings.scanner.recentEditors[vscodeRow.key].stateDbPath).toBe('C:/state.vscdb')
    expect(settings.scanner.cliEditors[cliRow.key].historyRootPath).toBe('C:/cli-history')
  })

  it('detects jetbrains config root when ide scanning is enabled', async () => {
    const settings = useSettingsStore()
    settings.scanner.ideEnabled = true
    settings.scanner.jetbrains.enabled = true
    vi.mocked(window.api.detectJetBrainsConfigRootPath).mockResolvedValue('C:/JetBrains')

    const scanner = useAutoProjectScanner()
    await scanner.detectJetbrainsRoot()

    expect(settings.scanner.jetbrains.configRootPath).toBe('C:/JetBrains')
    expect(scanner.detectingScannerKeys.value.has('jetbrains')).toBe(false)
  })

  it('skips jetbrains detection when disabled or already detecting', async () => {
    const settings = useSettingsStore()
    settings.scanner.ideEnabled = false
    settings.scanner.jetbrains.enabled = true

    const scanner = useAutoProjectScanner()
    await scanner.detectJetbrainsRoot()
    expect(window.api.detectJetBrainsConfigRootPath).not.toHaveBeenCalled()

    settings.scanner.ideEnabled = true
    scanner.detectingScannerKeys.value = new Set(['jetbrains'])
    await scanner.detectJetbrainsRoot()
    expect(window.api.detectJetBrainsConfigRootPath).not.toHaveBeenCalled()
  })

  it('detects vscode and cli scanner sources', async () => {
    const settings = useSettingsStore()
    settings.scanner.ideEnabled = true
    const scanner = useAutoProjectScanner()
    const vscodeRow = scanner.scannerSourceRows.value.find(row => row.kind === 'vscode-history')
    const cliRow = scanner.scannerSourceRows.value.find(row => row.kind === 'cli-history')
    expect(vscodeRow && cliRow).toBeTruthy()
    if (!vscodeRow || !cliRow)
      return

    vscodeRow.config.enabled = true
    cliRow.config.enabled = true
    vi.mocked(window.api.detectRecentEditorStateDbPath).mockResolvedValue('C:/vscode.vscdb')
    vi.mocked(window.api.detectCliHistoryRootPath).mockResolvedValue('C:/codex')

    await scanner.detectScannerSource(vscodeRow)
    await scanner.detectScannerSource(cliRow)

    expect(window.api.detectRecentEditorStateDbPath).toHaveBeenCalledWith(vscodeRow.key)
    expect(window.api.detectCliHistoryRootPath).toHaveBeenCalledWith(cliRow.key)
    expect(scanner.getScannerSourcePath(vscodeRow)).toBe('C:/vscode.vscdb')
    expect(scanner.getScannerSourcePath(cliRow)).toBe('C:/codex')
  })

  it('browses scanner sources with file dialog for vscode and folder dialog for cli', async () => {
    const settings = useSettingsStore()
    settings.scanner.ideEnabled = true
    const scanner = useAutoProjectScanner()
    const vscodeRow = scanner.scannerSourceRows.value.find(row => row.kind === 'vscode-history')
    const cliRow = scanner.scannerSourceRows.value.find(row => row.kind === 'cli-history')
    expect(vscodeRow && cliRow).toBeTruthy()
    if (!vscodeRow || !cliRow)
      return

    vscodeRow.config.enabled = true
    cliRow.config.enabled = true
    vi.mocked(window.api.openFileDialog).mockResolvedValue('D:/state.vscdb')
    vi.mocked(window.api.openFolderDialog).mockResolvedValue('D:/cli')

    await scanner.browseScannerSource(vscodeRow)
    await scanner.browseScannerSource(cliRow)

    expect(window.api.openFileDialog).toHaveBeenCalled()
    expect(window.api.openFolderDialog).toHaveBeenCalled()
    expect(scanner.getScannerSourcePath(vscodeRow)).toBe('D:/state.vscdb')
    expect(scanner.getScannerSourcePath(cliRow)).toBe('D:/cli')
  })

  it('clears scan history and closes the confirm dialog', () => {
    const scannerStore = useProjectScannerStore()
    const clearSpy = vi.spyOn(scannerStore, 'clearProjectScannerData')
    const scanner = useAutoProjectScanner()
    scanner.showClearConfirm.value = true

    scanner.clearScanHistory()

    expect(clearSpy).toHaveBeenCalled()
    expect(scanner.showClearConfirm.value).toBe(false)
  })

  it('enables specified editor controls when either open mode is specified', () => {
    const settings = useSettingsStore()
    const scanner = useAutoProjectScanner()

    settings.scanner.rootOpenMode = 'language'
    settings.scanner.ideOpenMode = 'source'
    expect(scanner.specifiedEditorEnabled.value).toBe(false)

    settings.scanner.rootOpenMode = 'specified'
    expect(scanner.specifiedEditorEnabled.value).toBe(true)

    settings.scanner.rootOpenMode = 'language'
    settings.scanner.ideOpenMode = 'specified'
    expect(scanner.specifiedEditorEnabled.value).toBe(true)
  })

  it('exposes editor options from visible code editor order', () => {
    const settings = useSettingsStore()
    // Bypass setEditorVisible floor so the suite can pin an exact visible set.
    for (const editor of Object.keys(settings.visibleEditors) as Array<keyof typeof settings.visibleEditors>)
      settings.visibleEditors[editor] = false
    settings.visibleEditors[CodeEditorEnum.VisualStudioCode] = true
    settings.visibleEditors[CodeEditorEnum.Cursor] = true

    const scanner = useAutoProjectScanner()
    expect(scanner.editorOptions.value.map(option => option.value)).toEqual(
      settings.visibleCodeEditorOrder,
    )
    expect(new Set(scanner.editorOptions.value.map(option => option.value))).toEqual(
      new Set([CodeEditorEnum.VisualStudioCode, CodeEditorEnum.Cursor]),
    )
  })
})
