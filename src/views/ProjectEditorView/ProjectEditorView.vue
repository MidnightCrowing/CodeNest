<script lang="ts" setup>
import UiScrollArea from '~/components/ui/UiScrollArea.vue'

import ProjectEditorFormPanel from './components/ProjectEditorFormPanel.vue'
import ProjectEditorHeader from './components/ProjectEditorHeader.vue'
import ProjectEditorSummaryPanel from './components/ProjectEditorSummaryPanel.vue'
import { useProjectEditor } from './composables/useProjectEditor'
import { isUpdateProject } from './ProjectEditorViewProvider'

defineOptions({
  name: 'ProjectEditor',
})

const {
  analyzing,
  browseProjectPath,
  canSave,
  closeEditor,
  detectingLicense,
  duplicatePath,
  effectivePath,
  editorOptions,
  fieldInvalid,
  fillProjectName,
  fillSourceName,
  folderStatus,
  handlePathBlur,
  isRemote,
  languageOptions,
  licenseOptions,
  mainLanguageStatus,
  markTouched,
  modeOptions,
  projectKindOptions,
  projectMode,
  projectsStore,
  repositoryFolderName,
  runAnalyzeProject,
  runDetectLicense,
  saveProject,
  setProjectMode,
  sourceSuggestion,
  summaryItems,
  updateProjectKind,
  visibleAnalyzing,
} = useProjectEditor()
</script>

<template>
  <main size-full overflow-hidden flex flex-col bg="$ui-page-background">
    <ProjectEditorHeader
      :is-update="isUpdateProject"
      :can-save="canSave"
      :duplicate-path="duplicatePath"
      @close="closeEditor"
      @save="saveProject"
    />

    <UiScrollArea min-h-0 flex-1 type="always">
      <section
        class="editor-body"
        min-h-full px-14px pt-4px pb-14px
        grid items-start gap-12px
        grid-cols="[minmax(0,1fr)_300px]"
      >
        <ProjectEditorFormPanel
          :analyzing="analyzing"
          :browse-project-path="browseProjectPath"
          :detecting-license="detectingLicense"
          :duplicate-path="duplicatePath"
          :editor-options="editorOptions"
          :field-invalid="fieldInvalid"
          :fill-project-name="fillProjectName"
          :fill-source-name="fillSourceName"
          :folder-status="folderStatus"
          :group-options="projectsStore.allGroups"
          :handle-path-blur="handlePathBlur"
          :is-remote="isRemote"
          :is-update="isUpdateProject"
          :language-options="languageOptions"
          :license-options="licenseOptions"
          :main-language-status="mainLanguageStatus"
          :mark-touched="markTouched"
          :mode-options="modeOptions"
          :project-kind-options="projectKindOptions"
          :project-mode="projectMode"
          :repository-folder-name="repositoryFolderName"
          :run-analyze-project="runAnalyzeProject"
          :run-detect-license="runDetectLicense"
          :set-project-mode="setProjectMode"
          :source-suggestion="sourceSuggestion"
          :update-project-kind="updateProjectKind"
          :visible-analyzing="visibleAnalyzing"
        />

        <ProjectEditorSummaryPanel
          :analyzing="analyzing"
          :effective-path="effectivePath"
          :is-remote="isRemote"
          :run-analyze-project="runAnalyzeProject"
          :summary-items="summaryItems"
          :visible-analyzing="visibleAnalyzing"
        />
      </section>
    </UiScrollArea>
  </main>
</template>

<style lang="scss" scoped>
@media (max-width: 960px) {
  .editor-body {
    @apply grid-cols-[1fr];
  }
}

@media (max-width: 680px) {
  .editor-body {
    @apply px-10px pb-10px;
  }
}
</style>
