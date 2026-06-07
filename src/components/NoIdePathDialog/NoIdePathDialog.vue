<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiDialog from '~/components/ui/UiDialog.vue'
import { SettingPageEnum, ViewEnum } from '~/constants/appEnums'
import { activatedPage } from '~/views/SettingsView'

import { hideNoIdePathDialog, isDialogVisible } from './NoIdePathDialogProvider'

const { t } = useI18n()

const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeSettingsView() {
  if (activatedView) {
    activatedView.value = ViewEnum.Settings
  }
  activatedPage.value = SettingPageEnum.Ides
  hideNoIdePathDialog()
}
</script>

<template>
  <UiDialog
    :open="isDialogVisible"
    :title="t('no_ide_path_dialog.dialog_title')"
    :description="t('no_ide_path_dialog.dialog_desc')"
    @update:open="open => !open && hideNoIdePathDialog()"
  >
    <template #actions>
      <button class="primary-button" type="button" @click="changeSettingsView">
        {{ t('no_ide_path_dialog.set') }}
      </button>
      <button class="ghost-button" type="button" @click="hideNoIdePathDialog">
        {{ t('no_ide_path_dialog.cancel') }}
      </button>
    </template>
  </UiDialog>
</template>
