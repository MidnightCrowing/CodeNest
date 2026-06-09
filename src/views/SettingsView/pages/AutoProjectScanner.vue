<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
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

type ScannerSourceKey = VscodeHistoryScannerEditor | CliHistoryScannerEditor
type ScannerDetectKey = 'jetbrains' | ScannerSourceKey

interface VscodeScannerSourceRow {
  key: VscodeHistoryScannerEditor
  kind: 'vscode-history'
  label: string
  config: RecentEditorScannerConfig
}

interface CliScannerSourceRow {
  key: CliHistoryScannerEditor
  kind: 'cli-history'
  label: string
  config: CliEditorScannerConfig
}

type ScannerSourceRow = VscodeScannerSourceRow | CliScannerSourceRow

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

  const selectedPaths = await window.api.openFolderDialog()
  if (!selectedPaths.length) {
    return
  }

  const roots = Array.from(new Set([...settings.scanner.roots, ...selectedPaths])).sort()
  settings.scanner.roots.splice(0, settings.scanner.roots.length, ...roots)
  settings.scanner.rootsEnabled = true
}

function removeRoot(root: string) {
  const index = settings.scanner.roots.indexOf(root)
  if (index >= 0) {
    settings.scanner.roots.splice(index, 1)
  }
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

  const selectedPaths = await window.api.openFolderDialog()
  if (selectedPaths[0]) {
    settings.scanner.jetbrains.configRootPath = selectedPaths[0]
  }
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

  const selectedPaths = row.kind === 'vscode-history'
    ? await window.api.openFileDialog({
        fileTypes: [{ name: t('app.dialog.file_types.editor_history_database'), extensions: ['vscdb'] }],
      })
    : await window.api.openFolderDialog()

  if (selectedPaths[0]) {
    setScannerSourcePath(row, selectedPaths[0])
  }
}

async function detectJetbrainsRoot() {
  if (!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled || detectingScannerKeys.value.has('jetbrains'))
    return

  detectingScannerKeys.value = new Set([...detectingScannerKeys.value, 'jetbrains'])
  setVisibleDetectingScannerKey('jetbrains', true)
  try {
    const detectedPath = await window.api.detectJetBrainsConfigRootPath()
    if (detectedPath) {
      settings.scanner.jetbrains.configRootPath = detectedPath
    }
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
    if (detectedPath) {
      setScannerSourcePath(row, detectedPath)
    }
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
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h2>{{ t('app.settings.scanner.title') }}</h2>
    </header>

    <div class="settings-grid">
      <section class="settings-panel">
        <header class="panel-header">
          <strong>{{ t('app.settings.scanner.sources.title') }}</strong>
          <span>{{ t('app.settings.scanner.sources.desc') }}</span>
        </header>

        <div class="toggle-row">
          <UiCheckbox v-model="settings.scanner.rootsEnabled">
            <div class="checkbox-copy">
              <strong>{{ t('app.settings.scanner.roots.title') }}</strong>
              <span>{{ t('app.settings.scanner.roots.desc') }}</span>
            </div>
          </UiCheckbox>
        </div>

        <div class="source-child-group" :class="{ disabled: !settings.scanner.rootsEnabled }">
          <div class="inline-actions">
            <button class="ghost-button" type="button" :disabled="!settings.scanner.rootsEnabled" @click="addProjectRoot">
              <span class="i-lucide:plus" />
              {{ t('app.settings.scanner.roots.add') }}
            </button>
            <span class="subtle-count">{{ t('app.settings.scanner.roots.count', { count: settings.scanner.roots.length }) }}</span>
          </div>

          <div class="path-list ui-native-scrollbar" role="list">
            <div v-if="settings.scanner.roots.length === 0" class="empty-inline">
              {{ t('app.settings.scanner.roots.empty') }}
            </div>
            <div
              v-for="root in settings.scanner.roots"
              :key="root"
              :ref="el => setRootRowRef(root, el)"
              class="path-row"
              role="listitem"
              :tabindex="settings.scanner.rootsEnabled ? 0 : -1"
              :aria-label="root"
              aria-keyshortcuts="Delete"
              @keydown="handleRootRowKeydown(root, $event)"
            >
              <span :title="root">{{ root }}</span>
              <button
                class="icon-button"
                type="button"
                data-root-action="remove"
                :title="t('app.settings.scanner.roots.remove')"
                :aria-label="t('app.settings.scanner.roots.remove')"
                :disabled="!settings.scanner.rootsEnabled"
                @click="removeRoot(root)"
              >
                <span class="i-lucide:x" />
              </button>
            </div>
          </div>
        </div>

        <div class="toggle-row">
          <UiCheckbox v-model="settings.scanner.ideEnabled">
            <div class="checkbox-copy">
              <strong>{{ t('app.settings.scanner.ide.title') }}</strong>
              <span>{{ t('app.settings.scanner.ide.desc') }}</span>
            </div>
          </UiCheckbox>
        </div>

        <div class="source-child-group ide-source-group" :class="{ disabled: !settings.scanner.ideEnabled }">
          <div
            v-for="row in scannerSourceRows"
            :key="row.key"
            class="source-row"
          >
            <UiCheckbox
              v-model="row.config.enabled"
              :disabled="!settings.scanner.ideEnabled"
            >
              {{ row.label }}
            </UiCheckbox>
            <input
              :value="getScannerSourcePath(row)"
              class="path-input"
              spellcheck="false"
              :aria-label="getScannerSourcePlaceholder(row)"
              :placeholder="getScannerSourcePlaceholder(row)"
              :disabled="!settings.scanner.ideEnabled || !row.config.enabled"
              @input="handleScannerSourcePathInput(row, $event)"
            >
            <button
              class="icon-button"
              type="button"
              :title="t('app.settings.scanner.auto_detect')"
              :aria-label="t('app.settings.scanner.auto_detect')"
              :disabled="!settings.scanner.ideEnabled || !row.config.enabled || detectingScannerKeys.has(row.key)"
              @click="detectScannerSource(row)"
            >
              <span class="i-lucide:wand-sparkles" :class="{ spinning: visibleDetectingScannerKeys.has(row.key) }" />
            </button>
            <button
              class="icon-button"
              type="button"
              :title="row.kind === 'vscode-history' ? t('app.settings.scanner.recent_editor.browse') : t('app.common.browse_folder')"
              :aria-label="row.kind === 'vscode-history' ? t('app.settings.scanner.recent_editor.browse') : t('app.common.browse_folder')"
              :disabled="!settings.scanner.ideEnabled || !row.config.enabled"
              @click="browseScannerSource(row)"
            >
              <span class="i-lucide:folder-open" />
            </button>
          </div>

          <div class="source-row">
            <UiCheckbox
              v-model="settings.scanner.jetbrains.enabled"
              :disabled="!settings.scanner.ideEnabled"
            >
              JetBrains
            </UiCheckbox>
            <input
              v-model="settings.scanner.jetbrains.configRootPath"
              class="path-input"
              spellcheck="false"
              :aria-label="t('app.settings.scanner.jetbrains.placeholder')"
              :placeholder="t('app.settings.scanner.jetbrains.placeholder')"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled"
            >
            <button
              class="icon-button"
              type="button"
              :title="t('app.settings.scanner.auto_detect')"
              :aria-label="t('app.settings.scanner.auto_detect')"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled || detectingScannerKeys.has('jetbrains')"
              @click="detectJetbrainsRoot"
            >
              <span class="i-lucide:wand-sparkles" :class="{ spinning: visibleDetectingScannerKeys.has('jetbrains') }" />
            </button>
            <button
              class="icon-button"
              type="button"
              :title="t('app.common.browse_folder')"
              :aria-label="t('app.common.browse_folder')"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled"
              @click="browseJetbrainsRoot"
            >
              <span class="i-lucide:folder-open" />
            </button>
          </div>
        </div>
      </section>

      <section class="settings-panel">
        <header class="panel-header">
          <strong>{{ t('app.settings.scanner.strategy.title') }}</strong>
          <span>{{ t('app.settings.scanner.strategy.desc') }}</span>
        </header>

        <div class="setting-row">
          <div class="setting-copy">
            <strong>{{ t('app.settings.scanner.root_open_mode.title') }}</strong>
            <span>{{ t('app.settings.scanner.root_open_mode.desc') }}</span>
          </div>
          <UiSegmentedControl
            v-model="settings.scanner.rootOpenMode"
            :options="rootOpenModeOptions"
            :aria-label="t('app.settings.scanner.root_open_mode.title')"
          />
        </div>

        <div class="setting-row">
          <div class="setting-copy">
            <strong>{{ t('app.settings.scanner.ide_open_mode.title') }}</strong>
            <span>{{ t('app.settings.scanner.ide_open_mode.desc') }}</span>
          </div>
          <UiSegmentedControl
            v-model="settings.scanner.ideOpenMode"
            :options="ideOpenModeOptions"
            :aria-label="t('app.settings.scanner.ide_open_mode.title')"
          />
        </div>

        <div class="setting-row">
          <div class="setting-copy">
            <strong>{{ t('app.settings.scanner.specified_editor.title') }}</strong>
            <span>{{ t('app.settings.scanner.specified_editor.desc') }}</span>
          </div>
          <UiSelect
            v-model="settings.scanner.editor"
            :options="editorOptions"
            :aria-label="t('app.settings.scanner.specified_editor.title')"
            :disabled="!specifiedEditorEnabled"
            min-width="160px"
            content-width="210px"
          />
        </div>

        <div class="setting-row">
          <div class="setting-copy">
            <strong>{{ t('app.settings.scanner.name_pattern.title') }}</strong>
            <span>{{ t('app.settings.scanner.name_pattern.desc') }}</span>
          </div>
          <input
            v-model="settings.scanner.namePattern"
            class="path-input compact"
            spellcheck="false"
            :aria-label="t('app.settings.scanner.name_pattern.title')"
          >
        </div>

        <div class="maintenance-box">
          <div>
            <strong>{{ t('app.settings.scanner.history.title') }}</strong>
            <span>{{ t('app.settings.scanner.history.desc') }}</span>
          </div>
          <button class="danger-button" type="button" @click="showClearConfirm = true">
            {{ t('app.settings.scanner.history.clear') }}
          </button>
        </div>
      </section>
    </div>

    <UiDialog
      v-model:open="showClearConfirm"
      :title="t('app.settings.scanner.history.dialog_title')"
      :description="t('app.settings.scanner.history.dialog_desc')"
      width="320px"
      actions-layout="end"
    >
      <template #actions>
        <button class="ghost-button" type="button" @click="showClearConfirm = false">
          {{ t('app.common.cancel') }}
        </button>
        <button class="danger-button" type="button" @click="clearScanHistory">
          {{ t('app.common.clear') }}
        </button>
      </template>
    </UiDialog>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  @apply relative flex flex-col gap-10px;
}

.page-header {
  @apply flex items-end justify-between gap-10px;

  h2 {
    @apply m-0 text-16px font-650;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
  }
}

.settings-grid {
  @apply grid gap-25px;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
}

.settings-panel {
  @apply min-w-0 flex flex-col gap-8px;
}

.panel-header {
  @apply min-h-34px flex flex-col gap-3px;

  strong {
    @apply text-13px font-650;
    overflow-wrap: anywhere;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
    overflow-wrap: anywhere;
  }
}

.toggle-row,
.setting-row,
.maintenance-box {
  @apply min-h-42px flex items-center justify-between gap-12px;
}

.maintenance-box {
  @apply flex-wrap;

  > div {
    @apply flex-1;
  }

  > button {
    @apply ml-auto;
  }
}

.toggle-row {
  @apply justify-start;
}

.checkbox-copy,
.setting-copy,
.maintenance-box div {
  @apply min-w-0 flex flex-col gap-3px;

  strong {
    @apply text-13px font-620;
    overflow-wrap: anywhere;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
    overflow-wrap: anywhere;
  }
}

.inline-actions {
  @apply flex items-center gap-8px;
}

.source-child-group {
  @apply ml-24px pl-12px flex flex-col gap-7px border-l;
  @apply border-$ui-border;

  &.disabled {
    @apply opacity-55;

    .path-row span,
    .subtle-count,
    .empty-inline {
      @apply color-$ui-muted-foreground;
    }
  }
}

.subtle-count,
.empty-inline {
  @apply text-12px light:color-$gray-6 dark:color-$gray-8;
}

.path-list {
  @apply max-h-128px overflow-auto pl-1px pr-0;
  scrollbar-gutter: auto;
}

.path-row {
  @apply h-31px flex items-center gap-8px rounded-4px outline-none;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--ui-ring);
  }

  span {
    @apply min-w-0 flex-1 truncate text-12px light:color-$gray-3 dark:color-$gray-12;
  }

  .icon-button {
    @apply bg-transparent hover:bg-$ui-hover-background;
  }
}

.empty-inline {
  @apply py-9px;
}

.source-row {
  @apply min-h-36px grid items-center gap-7px;
  grid-template-columns: max-content minmax(160px, 1fr) 28px 28px;

  @apply text-12px;

  :deep(.ui-checkbox-label) {
    @apply whitespace-nowrap;
  }
}

.ide-source-group {
  @apply grid items-center gap-x-7px gap-y-10px;
  grid-template-columns: max-content minmax(160px, 1fr) 28px 28px;

  .source-row {
    display: contents;
  }
}

.spinning {
  animation: spin-detect 0.8s linear infinite;
}

@keyframes spin-detect {
  to {
    transform: rotate(360deg);
  }
}

.path-input.compact {
  @apply w-180px;
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .source-row,
  .ide-source-group {
    grid-template-columns: max-content minmax(0, 1fr) 28px 28px;
  }
}
</style>
