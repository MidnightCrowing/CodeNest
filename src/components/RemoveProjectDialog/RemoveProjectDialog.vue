<script lang="ts" setup>
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'

import { useProjectsStore } from '~/stores/projectsStore'

import { hideRemoveDialog, isDialogVisible, projectToRemove } from './RemoveProjectDialogProvider'

const { t } = useI18n()
const projectsStore = useProjectsStore()

const isRemove = computed(() => {
  if (projectToRemove.value?.isExists === false) {
    return true
  }
  return projectToRemove.value?.isTemporary !== true
})

function confirmRemove(deleteFiles = false) {
  if (projectToRemove.value) {
    if (deleteFiles) {
      window.api.deleteProject(projectToRemove.value.path)
    }

    projectsStore.removeProject(projectToRemove.value.appendTime)
  }
  hideRemoveDialog()
}
</script>

<template>
  <DialogRoot
    :open="isDialogVisible"
    @update:open="open => !open && hideRemoveDialog()"
  >
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-content">
        <template v-if="isRemove">
          <DialogTitle class="dialog-title">
            {{ t('remove_project_dialog.dialog_title.remove') }}
          </DialogTitle>
          <DialogDescription class="dialog-description">
            {{ t('remove_project_dialog.dialog_desc.remove', { name: projectToRemove?.name }) }}
          </DialogDescription>
        </template>

        <template v-else>
          <DialogTitle class="dialog-title">
            {{ t('remove_project_dialog.dialog_title.delete') }}
          </DialogTitle>
          <DialogDescription class="dialog-description">
            {{ t('remove_project_dialog.dialog_desc.delete', { name: projectToRemove?.name }) }}
          </DialogDescription>
          <p class="warning-text">
            {{ t('remove_project_dialog.dialog_desc.delete_note') }}
          </p>
        </template>

        <div class="dialog-actions">
          <button class="danger-button" type="button" @click="confirmRemove(!isRemove)">
            {{ isRemove ? t('remove_project_dialog.remove') : t('remove_project_dialog.delete') }}
          </button>
          <button v-if="!isRemove" class="ghost-button" type="button" @click="confirmRemove(false)">
            {{ t('remove_project_dialog.remove_from_list') }}
          </button>
          <button class="ghost-button" type="button" @click="hideRemoveDialog">
            {{ t('remove_project_dialog.cancel') }}
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style lang="scss" scoped>
.dialog-overlay {
  @apply fixed left-0 right-0 bottom-0 top-40px z-40;
  @apply bg-black/30 dark:bg-black/50;
}

.dialog-content {
  @apply fixed left-1/2 top-[calc(40px+50%)] z-50 w-400px max-w-[calc(100vw-32px)];
  @apply -translate-x-1/2 -translate-y-1/2 rounded-6px border p-18px shadow-xl outline-none;
  @apply border-$ui-border bg-$ui-surface-background color-$ui-foreground;
}

.dialog-title {
  @apply m-0 text-15px font-650 lh-20px;
}

.dialog-description {
  @apply mt-8px mb-0 text-13px lh-18px light:color-$gray-5 dark:color-$gray-9;
}

.warning-text {
  @apply mt-8px mb-0 text-13px lh-18px color-$red-5;
}

.dialog-actions {
  @apply mt-20px flex flex-row-reverse gap-8px;
}

.ghost-button,
.danger-button {
  @apply h-28px border-0 rounded-5px px-10px;
  @apply inline-flex items-center justify-center gap-5px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.ghost-button {
  @apply bg-$ui-control-background color-$ui-foreground;
  @apply hover:bg-$ui-hover-background;
}

.danger-button {
  @apply bg-$red-5 color-white hover:bg-$red-6;
}
</style>
