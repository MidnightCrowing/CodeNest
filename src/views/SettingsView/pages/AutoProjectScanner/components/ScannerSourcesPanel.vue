<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import { useSettingsStore } from '~/stores/settingsStore'

import type { ScannerDetectKey, ScannerSourceRow } from '../composables/useAutoProjectScanner'

defineProps<{
  browseJetbrainsRoot: () => Promise<void>
  browseScannerSource: (row: ScannerSourceRow) => Promise<void>
  detectJetbrainsRoot: () => Promise<void>
  detectingScannerKeys: Set<ScannerDetectKey>
  detectScannerSource: (row: ScannerSourceRow) => Promise<void>
  getScannerSourcePath: (row: ScannerSourceRow) => string
  getScannerSourcePlaceholder: (row: ScannerSourceRow) => string
  handleRootRowKeydown: (root: string, event: KeyboardEvent) => void
  handleScannerSourcePathInput: (row: ScannerSourceRow, event: Event) => void
  addProjectRoot: () => Promise<void>
  removeRoot: (root: string) => void
  scannerSourceRows: ScannerSourceRow[]
  setRootRowRef: (root: string, element: unknown) => void
  visibleDetectingScannerKeys: Set<ScannerDetectKey>
}>()

const { t } = useI18n()
const settings = useSettingsStore()
</script>

<template>
  <section min-w-0 flex flex-col gap-8px>
    <header min-h-34px flex flex-col gap-3px>
      <strong text-13px font-650>{{ t('app.settings.scanner.sources.title') }}</strong>
      <span text-12px light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.sources.desc') }}</span>
    </header>

    <div min-h-42px flex items-center justify-start gap-12px>
      <UiCheckbox v-model="settings.scanner.rootsEnabled">
        <div min-w-0 flex flex-col gap-3px>
          <strong text-13px font-620>{{ t('app.settings.scanner.roots.title') }}</strong>
          <span text-12px light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.roots.desc') }}</span>
        </div>
      </UiCheckbox>
    </div>

    <div
      class="source-child-group"
      ml-24px pl-12px flex flex-col gap-7px
      border-l border="$ui-border"
      :class="{ disabled: !settings.scanner.rootsEnabled }"
    >
      <div flex items-center gap-8px>
        <button class="ghost-button" type="button" :disabled="!settings.scanner.rootsEnabled" @click="addProjectRoot">
          <span class="i-lucide:plus" />
          {{ t('app.settings.scanner.roots.add') }}
        </button>
        <span class="subtle-count" text-12px light:color="$gray-6" dark:color="$gray-8">
          {{ t('app.settings.scanner.roots.count', { count: settings.scanner.roots.length }) }}
        </span>
      </div>

      <div
        max-h-128px overflow-auto pl-1px pr-0
        class="path-list ui-native-scrollbar"
        role="list"
      >
        <div
          v-if="settings.scanner.roots.length === 0"
          class="empty-inline"
          py-9px text-12px
          light:color="$gray-6" dark:color="$gray-8"
        >
          {{ t('app.settings.scanner.roots.empty') }}
        </div>
        <div
          v-for="root in settings.scanner.roots"
          :key="root"
          :ref="el => setRootRowRef(root, el)"
          class="path-row"
          h-31px flex items-center gap-8px rounded-4px
          outline-none
          role="listitem"
          :tabindex="settings.scanner.rootsEnabled ? 0 : -1"
          :aria-label="root"
          aria-keyshortcuts="Delete"
          @keydown="handleRootRowKeydown(root, $event)"
        >
          <span
            min-w-0 flex-1 truncate text-12px
            light:color="$gray-3" dark:color="$gray-12"
            :title="root"
          >{{ root }}</span>
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

    <div min-h-42px flex items-center justify-start gap-12px>
      <UiCheckbox v-model="settings.scanner.ideEnabled">
        <div min-w-0 flex flex-col gap-3px>
          <strong text-13px font-620>{{ t('app.settings.scanner.ide.title') }}</strong>
          <span text-12px light:color="$gray-6" dark:color="$gray-8">{{ t('app.settings.scanner.ide.desc') }}</span>
        </div>
      </UiCheckbox>
    </div>

    <div
      class="source-child-group ide-source-group"
      ml-24px pl-12px flex flex-col gap-7px
      border-l border="$ui-border"
      :class="{ disabled: !settings.scanner.ideEnabled }"
    >
      <div
        v-for="row in scannerSourceRows"
        :key="row.key"
        class="source-row"
        min-h-36px grid items-center gap-7px text-12px
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

      <div
        class="source-row"
        min-h-36px grid items-center gap-7px text-12px
      >
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
</template>

<style lang="scss" scoped>
strong,
span {
  overflow-wrap: anywhere;
}

.source-child-group {
  &.disabled {
    @apply opacity-55;

    .path-row span,
    .subtle-count,
    .empty-inline {
      @apply color-$ui-muted-foreground;
    }
  }
}

.path-list {
  scrollbar-gutter: auto;
}

.path-row {
  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--ui-ring);
  }

  .icon-button {
    @apply bg-transparent hover:bg-$ui-hover-background;
  }
}

.source-row {
  grid-template-columns: max-content minmax(160px, 1fr) 28px 28px;

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

@media (max-width: 900px) {
  .source-row,
  .ide-source-group {
    grid-template-columns: max-content minmax(0, 1fr) 28px 28px;
  }
}
</style>
