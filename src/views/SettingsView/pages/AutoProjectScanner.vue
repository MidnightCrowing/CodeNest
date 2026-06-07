<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useSettingsStore } from '~/stores/settingsStore'

const settings = useSettingsStore()
const projectScannerStore = useProjectScannerStore()
const { t } = useI18n()
const showClearConfirm = ref(false)

const editorOptions = computed<Array<{ value: CodeEditorEnum, label: string }>>(() =>
  (Object.keys(codeEditors) as CodeEditorEnum[]).map(editor => ({
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
    fileTypes: [{ name: 'VS Code Database', extensions: ['vscdb'] }],
  })
  if (selectedPaths[0]) {
    settings.scanner.vscode.stateDbPath = selectedPaths[0]
  }
}

async function detectJetbrainsRoot() {
  if (!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled)
    return

  const detectedPath = await window.api.detectJetBrainsConfigRootPath()
  if (detectedPath) {
    settings.scanner.jetbrains.configRootPath = detectedPath
  }
}

async function detectVscodeDb() {
  if (!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled)
    return

  const detectedPath = await window.api.detectVscodeStateDbPath()
  if (detectedPath) {
    settings.scanner.vscode.stateDbPath = detectedPath
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

          <div class="path-list">
            <div v-if="settings.scanner.roots.length === 0" class="empty-inline">
              {{ t('app.settings.scanner.roots.empty') }}
            </div>
            <div v-for="root in settings.scanner.roots" :key="root" class="path-row">
              <span :title="root">{{ root }}</span>
              <button
                class="icon-button"
                type="button"
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
              class="ghost-button"
              type="button"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.jetbrains.enabled"
              @click="detectJetbrainsRoot"
            >
              {{ t('app.common.detect') }}
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
              class="ghost-button"
              type="button"
              :disabled="!settings.scanner.ideEnabled || !settings.scanner.vscode.enabled"
              @click="detectVscodeDb"
            >
              {{ t('app.common.detect') }}
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
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
  }
}

.toggle-row,
.setting-row,
.maintenance-box {
  @apply min-h-42px flex items-center justify-between gap-12px;
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
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
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
  @apply h-31px flex items-center gap-8px;

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
  grid-template-columns: 84px minmax(160px, 1fr) 70px 28px;

  @apply text-12px;
}

.path-input.compact {
  @apply w-180px;
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .source-row {
    grid-template-columns: 84px minmax(0, 1fr) 70px 28px;
  }
}
</style>
