<script lang="ts" setup>
import { JeButton, JePopup } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { projectManager } from '~/core/main'

import { hideDeleteDialog, isDialogVisible, projectToDelete } from './DeleteProjectDialogProvider'

const { t } = useI18n()

function confirmDelete() {
  if (projectToDelete.value)
    projectManager.removeProject(projectToDelete.value.appendTime)
  hideDeleteDialog()
}
</script>

<template>
  <div
    v-if="isDialogVisible"
    pos="fixed top-40px bottom-0 left-0 right-0"
    flex="~ items-center justify-center"
    bg="light:black/30 dark:black/50"
  >
    <JePopup p="20px" rounded="8px" w="400px">
      <h3>{{ t('delete_project_dialog.dialog_title') }}</h3>
      <p>{{ t('delete_project_dialog.dialog_desc', { name: projectToDelete?.name }) }}</p>
      <div m="t-20px b-5px" flex="~ row-reverse" gap="10px">
        <JeButton class="confirm-button" type="secondary" order-2 @click="confirmDelete">
          {{ t('delete_project_dialog.delete') }}
        </JeButton>
        <JeButton type="secondary" order-1 @click="hideDeleteDialog">
          {{ t('delete_project_dialog.cancel') }}
        </JeButton>
      </div>
    </JePopup>
  </div>
</template>

<style lang="scss">
.confirm-button.je-button.je-button--secondary {
  @apply light:color-$red-4 dark:color-$red-6;
}
</style>
