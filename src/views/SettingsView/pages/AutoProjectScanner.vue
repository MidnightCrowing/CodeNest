<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import ScannerClearHistoryDialog from './AutoProjectScanner/components/ScannerClearHistoryDialog.vue'
import ScannerSourcesPanel from './AutoProjectScanner/components/ScannerSourcesPanel.vue'
import ScannerStrategyPanel from './AutoProjectScanner/components/ScannerStrategyPanel.vue'
import { useAutoProjectScanner } from './AutoProjectScanner/composables/useAutoProjectScanner'

const { t } = useI18n()

const {
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
} = useAutoProjectScanner()
</script>

<template>
  <div relative flex flex-col gap-10px>
    <header flex items-end justify-between gap-10px>
      <h2 m-0 text-16px font-650>
        {{ t('app.settings.scanner.title') }}
      </h2>
    </header>

    <div class="settings-grid" grid gap-25px>
      <ScannerSourcesPanel
        :scanner-source-rows="scannerSourceRows"
        :detecting-scanner-keys="detectingScannerKeys"
        :visible-detecting-scanner-keys="visibleDetectingScannerKeys"
        :add-project-root="addProjectRoot"
        :remove-root="removeRoot"
        :set-root-row-ref="setRootRowRef"
        :handle-root-row-keydown="handleRootRowKeydown"
        :get-scanner-source-path="getScannerSourcePath"
        :get-scanner-source-placeholder="getScannerSourcePlaceholder"
        :handle-scanner-source-path-input="handleScannerSourcePathInput"
        :browse-scanner-source="browseScannerSource"
        :detect-scanner-source="detectScannerSource"
        :browse-jetbrains-root="browseJetbrainsRoot"
        :detect-jetbrains-root="detectJetbrainsRoot"
      />

      <ScannerStrategyPanel
        :editor-options="editorOptions"
        :root-open-mode-options="rootOpenModeOptions"
        :ide-open-mode-options="ideOpenModeOptions"
        :specified-editor-enabled="specifiedEditorEnabled"
        :show-clear-confirm="showClearConfirm"
        @update:show-clear-confirm="showClearConfirm = $event"
      />
    </div>

    <ScannerClearHistoryDialog
      :open="showClearConfirm"
      @update:open="showClearConfirm = $event"
      @clear="clearScanHistory"
    />
  </div>
</template>

<style lang="scss" scoped>
.settings-grid {
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
}

h2 {
  overflow-wrap: anywhere;
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
