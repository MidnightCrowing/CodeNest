import { useI18n } from 'vue-i18n'

import type { CliHistoryScannerEditor, CodeEditorEnum, VscodeHistoryScannerEditor } from '~/constants/codeEditor'
import {
  codeEditorOrder,
  codeEditors,
  isCliHistoryScannerEditor,
  isVscodeHistoryScannerEditor,
  projectHistoryScannerEditors,
  scannerEditorLabels,
} from '~/constants/codeEditor'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import type { CliEditorScannerConfig, RecentEditorScannerConfig } from '~/stores/settingsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { useDelayedBusyKeys } from '~/utils/useDelayedBusy'

export type ScannerSourceKey = VscodeHistoryScannerEditor | CliHistoryScannerEditor
export type ScannerDetectKey = 'jetbrains' | ScannerSourceKey

export interface VscodeScannerSourceRow {
  key: VscodeHistoryScannerEditor
  kind: 'vscode-history'
  label: string
  config: RecentEditorScannerConfig
}

export interface CliScannerSourceRow {
  key: CliHistoryScannerEditor
  kind: 'cli-history'
  label: string
  config: CliEditorScannerConfig
}

export type ScannerSourceRow = VscodeScannerSourceRow | CliScannerSourceRow

export function useAutoProjectScanner() {
  const settings = useSettingsStore()
  const projectScannerStore = useProjectScannerStore()
  const { t } = useI18n()
  const showClearConfirm = ref(false)
  const rootRowRefs = new Map<string, HTMLElement>()
  const detectingScannerKeys = ref<Set<ScannerDetectKey>>(new Set())
  const {
    visibleKeys: visibleDetectingScannerKeys,
    setKeyBusy: setVisibleDetectingScannerKey,
  } = useDelayedBusyKeys<ScannerDetectKey>({ delay: 220, minDuration: 320 })

  const editorOptions = computed<Array<{ value: CodeEditorEnum, label: string }>>(() =>
    codeEditorOrder.map(editor => ({
      value: editor,
      label: codeEditors[editor].label,
    })),
  )

  const rootOpenModeOptions = computed(() => [
    {
      value: 'language',
      label: t('app.settings.scanner.open_mode.language'),
      tooltip: t('app.settings.scanner.open_mode_help.language'),
    },
    {
      value: 'specified',
      label: t('app.settings.scanner.open_mode.specified'),
      tooltip: t('app.settings.scanner.open_mode_help.specified'),
    },
  ])

  const ideOpenModeOptions = computed(() => [
    {
      value: 'source',
      label: t('app.settings.scanner.open_mode.source'),
      tooltip: t('app.settings.scanner.open_mode_help.source'),
    },
    {
      value: 'language',
      label: t('app.settings.scanner.open_mode.language'),
      tooltip: t('app.settings.scanner.open_mode_help.ide_language'),
    },
    {
      value: 'specified',
      label: t('app.settings.scanner.open_mode.specified'),
      tooltip: t('app.settings.scanner.open_mode_help.specified'),
    },
  ])

  const specifiedEditorEnabled = computed(() =>
    settings.scanner.rootOpenMode === 'specified' || settings.scanner.ideOpenMode === 'specified',
  )

  const scannerSourceRows = computed<ScannerSourceRow[]>(() =>
    projectHistoryScannerEditors
      .map((editor) => {
        const label = scannerEditorLabels[editor] || codeEditors[editor].label
        if (isVscodeHistoryScannerEditor(editor)) {
          return {
            key: editor,
            kind: 'vscode-history',
            label,
            config: settings.scanner.recentEditors[editor],
          }
        }
        if (isCliHistoryScannerEditor(editor)) {
          return {
            key: editor,
            kind: 'cli-history',
            label,
            config: settings.scanner.cliEditors[editor],
          }
        }
        return null
      })
      .filter((row): row is ScannerSourceRow => row !== null),
  )

  async function addProjectRoot() {
    if (!settings.scanner.rootsEnabled)
      return

    const selectedPath = await window.api.openFolderDialog()
    if (!selectedPath)
      return

    const roots = Array.from(new Set([...settings.scanner.roots, selectedPath])).sort()
    settings.scanner.roots.splice(0, settings.scanner.roots.length, ...roots)
    settings.scanner.rootsEnabled = true
  }

  function removeRoot(root: string) {
    const index = settings.scanner.roots.indexOf(root)
    if (index >= 0)
      settings.scanner.roots.splice(index, 1)
  }

  function setRootRowRef(root: string, element: unknown) {
    if (element instanceof HTMLElement) {
      rootRowRefs.set(root, element)
      return
    }

    rootRowRefs.delete(root)
  }

  function focusRootRow(root: string | undefined, preferRemoveButton = false) {
    if (!root)
      return

    const row = rootRowRefs.get(root)
    if (!row)
      return

    const target = preferRemoveButton
      ? row.querySelector<HTMLButtonElement>('[data-root-action="remove"]:not(:disabled)') || row
      : row

    target.focus({ preventScroll: true })
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  function focusRootRowByOffset(root: string, offset: number, preferRemoveButton = false) {
    const roots = settings.scanner.roots
    const currentIndex = roots.indexOf(root)
    if (currentIndex < 0)
      return

    const targetIndex = Math.max(0, Math.min(roots.length - 1, currentIndex + offset))
    focusRootRow(roots[targetIndex], preferRemoveButton)
  }

  function focusRootRowAtEdge(edge: 'start' | 'end', preferRemoveButton = false) {
    focusRootRow(edge === 'start' ? settings.scanner.roots[0] : settings.scanner.roots.at(-1), preferRemoveButton)
  }

  async function removeFocusedRoot(root: string) {
    const roots = settings.scanner.roots
    const index = roots.indexOf(root)
    if (index < 0)
      return

    const nextRoot = roots[index + 1] || roots[index - 1]
    removeRoot(root)
    await nextTick()
    focusRootRow(nextRoot)
  }

  function handleRootRowKeydown(root: string, event: KeyboardEvent) {
    if (!settings.scanner.rootsEnabled || event.defaultPrevented)
      return

    const preferRemoveButton = event.target instanceof HTMLElement
      && !!event.target.closest('[data-root-action="remove"]')

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        focusRootRowByOffset(root, -1, preferRemoveButton)
        break
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        focusRootRowByOffset(root, 1, preferRemoveButton)
        break
      case 'Home':
        event.preventDefault()
        event.stopPropagation()
        focusRootRowAtEdge('start', preferRemoveButton)
        break
      case 'End':
        event.preventDefault()
        event.stopPropagation()
        focusRootRowAtEdge('end', preferRemoveButton)
        break
      case 'Delete':
        event.preventDefault()
        event.stopPropagation()
        void removeFocusedRoot(root)
        break
    }
  }

  async function browseJetbrainsRoot() {
    if (!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled)
      return

    const selectedPath = await window.api.openFolderDialog()
    if (selectedPath)
      settings.scanner.jetbrains.configRootPath = selectedPath
  }

  function getScannerSourcePath(row: ScannerSourceRow) {
    return row.kind === 'vscode-history'
      ? row.config.stateDbPath
      : row.config.historyRootPath
  }

  function setScannerSourcePath(row: ScannerSourceRow, value: string) {
    if (row.kind === 'vscode-history') {
      row.config.stateDbPath = value
      return
    }
    row.config.historyRootPath = value
  }

  function handleScannerSourcePathInput(row: ScannerSourceRow, event: Event) {
    const target = event.target
    if (target instanceof HTMLInputElement)
      setScannerSourcePath(row, target.value)
  }

  function getScannerSourcePlaceholder(row: ScannerSourceRow) {
    return row.kind === 'vscode-history'
      ? t('app.settings.scanner.recent_editor.placeholder', { editor: row.label })
      : t('app.settings.scanner.cli_editor.placeholder', { editor: row.label })
  }

  async function browseScannerSource(row: ScannerSourceRow) {
    if (!settings.scanner.ideEnabled || !row.config.enabled)
      return

    const selectedPath = row.kind === 'vscode-history'
      ? await window.api.openFileDialog({
          fileTypes: [{ name: t('app.dialog.file_types.editor_history_database'), extensions: ['vscdb'] }],
        })
      : await window.api.openFolderDialog()

    if (selectedPath)
      setScannerSourcePath(row, selectedPath)
  }

  async function detectJetbrainsRoot() {
    if (!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled || detectingScannerKeys.value.has('jetbrains'))
      return

    detectingScannerKeys.value = new Set([...detectingScannerKeys.value, 'jetbrains'])
    setVisibleDetectingScannerKey('jetbrains', true)
    try {
      const detectedPath = await window.api.detectJetBrainsConfigRootPath()
      if (detectedPath)
        settings.scanner.jetbrains.configRootPath = detectedPath
    }
    finally {
      const next = new Set(detectingScannerKeys.value)
      next.delete('jetbrains')
      detectingScannerKeys.value = next
      setVisibleDetectingScannerKey('jetbrains', false)
    }
  }

  async function detectScannerSource(row: ScannerSourceRow) {
    if (!settings.scanner.ideEnabled || !row.config.enabled || detectingScannerKeys.value.has(row.key))
      return

    detectingScannerKeys.value = new Set([...detectingScannerKeys.value, row.key])
    setVisibleDetectingScannerKey(row.key, true)
    try {
      const detectedPath = row.kind === 'vscode-history'
        ? await window.api.detectRecentEditorStateDbPath(row.key)
        : await window.api.detectCliHistoryRootPath(row.key)
      if (detectedPath)
        setScannerSourcePath(row, detectedPath)
    }
    finally {
      const next = new Set(detectingScannerKeys.value)
      next.delete(row.key)
      detectingScannerKeys.value = next
      setVisibleDetectingScannerKey(row.key, false)
    }
  }

  function clearScanHistory() {
    projectScannerStore.clearProjectScannerData()
    showClearConfirm.value = false
  }

  return {
    addProjectRoot,
    browseJetbrainsRoot,
    browseScannerSource,
    clearScanHistory,
    detectJetbrainsRoot,
    detectingScannerKeys,
    detectScannerSource,
    editorOptions,
    getScannerSourcePath,
    getScannerSourcePlaceholder,
    handleRootRowKeydown,
    handleScannerSourcePathInput,
    ideOpenModeOptions,
    removeRoot,
    rootOpenModeOptions,
    scannerSourceRows,
    setRootRowRef,
    showClearConfirm,
    specifiedEditorEnabled,
    visibleDetectingScannerKeys,
  }
}
