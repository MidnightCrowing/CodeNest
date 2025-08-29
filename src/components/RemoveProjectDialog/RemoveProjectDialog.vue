<script lang="ts" setup>
import { JeButton, JePopup } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { projectManager } from '~/services/projectManager'

import { hideRemoveDialog, isDialogVisible, projectToRemove } from './RemoveProjectDialogProvider'

const { t } = useI18n()

function isRemove() {
  if (projectToRemove.value?.isExists === false) {
    return true
  }
  return projectToRemove.value?.isTemporary !== true
}

function confirmRemove() {
  if (projectToRemove.value) {
    if (!isRemove()) {
      window.api.deleteProject(projectToRemove.value.path)
    }

    projectManager.removeProject(projectToRemove.value.appendTime)
  }
  hideRemoveDialog()
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
      <template v-if="isRemove()">
        <!-- 非临时项目 -->
        <h3>{{ t('remove_project_dialog.dialog_title.remove') }}</h3>
        <p>{{ t('remove_project_dialog.dialog_desc.remove', { name: projectToRemove?.name }) }}</p>
      </template>
      <template v-else>
        <!-- 临时项目 -->
        <h3>{{ t('remove_project_dialog.dialog_title.delete') }}</h3>
        <p whitespace-pre-line>
          {{ t('remove_project_dialog.dialog_desc.delete', { name: projectToRemove?.name }) }}
        </p>
      </template>

      <div m="t-20px b-5px" flex="~ row-reverse" gap="10px">
        <JeButton class="confirm-button" type="secondary" order-2 @click="confirmRemove">
          {{ isRemove() ? t('remove_project_dialog.remove') : t('remove_project_dialog.delete') }}
        </JeButton>
        <JeButton type="secondary" order-1 @click="hideRemoveDialog">
          {{ t('remove_project_dialog.cancel') }}
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
