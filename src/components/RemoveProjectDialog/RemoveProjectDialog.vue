<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiDialog from '~/components/ui/UiDialog.vue'
import { useProjectsStore } from '~/stores/projectsStore'

import { hideRemoveDialog, isDialogVisible, playRemoveAnimation, projectsToRemove, projectToRemove } from './RemoveProjectDialogProvider'

const { t } = useI18n()
const projectsStore = useProjectsStore()

const isBatchMode = computed(() => projectsToRemove.value.length > 0)
const targetProjects = computed(() => isBatchMode.value ? projectsToRemove.value : (projectToRemove.value ? [projectToRemove.value] : []))

const isRemove = computed(() => {
  if (isBatchMode.value) {
    // 批量模式：只要有一个是临时项目且存在，就显示删除选项
    return !targetProjects.value.some(p => p.isTemporary && p.isExists !== false)
  }
  if (projectToRemove.value?.isExists === false) {
    return true
  }
  return projectToRemove.value?.isTemporary !== true
})

const dialogTitle = computed(() => {
  if (isBatchMode.value) {
    return isRemove.value
      ? t('remove_project_dialog.dialog_title.batch_remove', { count: targetProjects.value.length })
      : t('remove_project_dialog.dialog_title.batch_delete', { count: targetProjects.value.length })
  }
  return isRemove.value
    ? t('remove_project_dialog.dialog_title.remove')
    : t('remove_project_dialog.dialog_title.delete')
})

const dialogDesc = computed(() => {
  if (isBatchMode.value) {
    return isRemove.value
      ? t('remove_project_dialog.dialog_desc.batch_remove', { count: targetProjects.value.length })
      : t('remove_project_dialog.dialog_desc.batch_delete', { count: targetProjects.value.length })
  }
  return isRemove.value
    ? t('remove_project_dialog.dialog_desc.remove', { name: projectToRemove.value?.name })
    : t('remove_project_dialog.dialog_desc.delete', { name: projectToRemove.value?.name })
})

async function confirmRemove(deleteFiles = false) {
  const projects = targetProjects.value
  if (projects.length === 0) {
    hideRemoveDialog()
    return
  }

  if (deleteFiles) {
    for (const project of projects) {
      if (project.isTemporary && project.isExists !== false) {
        window.api.deleteProject(project.path)
      }
    }
  }

  hideRemoveDialog()

  // 批量删除不播放动画，直接删除
  if (isBatchMode.value) {
    for (const project of projects) {
      projectsStore.removeProject(project.appendTime)
    }
  }
  else {
    // 单个删除播放动画
    const projectId = projects[0].appendTime
    await playRemoveAnimation(projectId)
    projectsStore.removeProject(projectId)
  }
}
</script>

<template>
  <UiDialog
    :open="isDialogVisible"
    @update:open="open => !open && hideRemoveDialog()"
  >
    <template #title>
      {{ dialogTitle }}
    </template>

    <template #description>
      {{ dialogDesc }}
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
</style>
