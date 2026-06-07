<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiDialog from '~/components/ui/UiDialog.vue'
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
  <UiDialog
    :open="isDialogVisible"
    @update:open="open => !open && hideRemoveDialog()"
  >
    <template #title>
      {{ isRemove ? t('remove_project_dialog.dialog_title.remove') : t('remove_project_dialog.dialog_title.delete') }}
    </template>

    <template #description>
      {{
        isRemove
          ? t('remove_project_dialog.dialog_desc.remove', { name: projectToRemove?.name })
          : t('remove_project_dialog.dialog_desc.delete', { name: projectToRemove?.name })
      }}
    </template>

    <p v-if="!isRemove" class="warning-text">
      {{ t('remove_project_dialog.dialog_desc.delete_note') }}
    </p>

    <template #actions>
      <button class="danger-button" type="button" @click="confirmRemove(!isRemove)">
        {{ isRemove ? t('remove_project_dialog.remove') : t('remove_project_dialog.delete') }}
      </button>
      <button v-if="!isRemove" class="ghost-button" type="button" @click="confirmRemove(false)">
        {{ t('remove_project_dialog.remove_from_list') }}
      </button>
      <button class="ghost-button" type="button" @click="hideRemoveDialog">
        {{ t('remove_project_dialog.cancel') }}
      </button>
    </template>
  </UiDialog>
</template>

<style lang="scss" scoped>
.warning-text {
  @apply mt-8px mb-0 text-13px lh-18px color-$red-5;
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
