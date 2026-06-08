<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditorOrder, codeEditors } from '~/constants/codeEditor'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { useDelayedBusyKeys } from '~/utils/useDelayedBusy'

type ScannerDetectKey = 'jetbrains' | 'vscode'

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

const openModeOptions = computed(() => [
  { value: 'auto', label: t('app.settings.scanner.open_mode.auto') },
  { value: 'specified', label: t('app.settings.scanner.open_mode.specified') },
])

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

async function browseVscodeDb() {
  if (!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled)
    return

  const selectedPaths = await window.api.openFileDialog({
    fileTypes: [{ name: t('app.dialog.file_types.vscode_database'), extensions: ['vscdb'] }],
  })
  if (selectedPaths[0]) {
    settings.scanner.vscode.stateDbPath = selectedPaths[0]
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

async function detectVscodeDb() {
  if (!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled || detectingScannerKeys.value.has('vscode'))
    return

  detectingScannerKeys.value = new Set([...detectingScannerKeys.value, 'vscode'])
  setVisibleDetectingScannerKey('vscode', true)
  try {
    const detectedPath = await window.api.detectVscodeStateDbPath()
    if (detectedPath) {
      settings.scanner.vscode.stateDbPath = detectedPath
    }
  }
  finally {
    const next = new Set(detectingScannerKeys.value)
    next.delete('vscode')
    detectingScannerKeys.value = next
    setVisibleDetectingScannerKey('vscode', false)
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

        <div class="source-child-group" :class="{ disabled: !settings.scanner.ideEnabled }">
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

          <div class="source-row">
            <UiCheckbox
              v-model="settings.scanner.vscode.enabled"
              :disabled="!settings.scanner.ideEnabled"
            >
              VS Code
            </UiCheckbox>
            <input
              v-model="settings.scanner.vscode.stateDbPath"
              class="path-input"
              spellcheck="false"
              :aria-label="t('app.settings.scanner.vscode.placeholder')"
              :placeholder="t('app.settings.scanner.vscode.placeholder')"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled"
            >
            <button
              class="icon-button"
              type="button"
              :title="t('app.settings.scanner.auto_detect')"
              :aria-label="t('app.settings.scanner.auto_detect')"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled || detectingScannerKeys.has('vscode')"
              @click="detectVscodeDb"
            >
              <span class="i-lucide:wand-sparkles" :class="{ spinning: visibleDetectingScannerKeys.has('vscode') }" />
            </button>
            <button
              class="icon-button"
              type="button"
              :title="t('app.settings.scanner.vscode.browse')"
              :aria-label="t('app.settings.scanner.vscode.browse')"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled"
              @click="browseVscodeDb"
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
            <strong>{{ t('app.settings.scanner.default_editor.title') }}</strong>
            <span>{{ t('app.settings.scanner.default_editor.desc') }}</span>
          </div>
          <UiSelect
            v-model="settings.scanner.openMode"
            :options="openModeOptions"
            :aria-label="t('app.settings.scanner.default_editor.title')"
            min-width="160px"
            content-width="180px"
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
            :disabled="settings.scanner.openMode !== 'specified'"
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
  @apply max-h-128px overflow-auto;
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
  grid-template-columns: 104px minmax(160px, 1fr) 28px 28px;

  @apply text-12px;

  :deep(.ui-checkbox-label) {
    @apply whitespace-nowrap;
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

  .source-row {
    grid-template-columns: 104px minmax(0, 1fr) 28px 28px;
  }
}
</style>
