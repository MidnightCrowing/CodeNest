<script lang="ts" setup>
import { JeButton, JePopup } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

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
  <div
    v-if="isDialogVisible"
    pos="fixed top-40px bottom-0 left-0 right-0"
    flex="~ items-center justify-center"
    bg="light:black/30 dark:black/50"
  >
    <JePopup p="20px" rounded="8px" w="400px">
      <h3>{{ t('no_ide_path_dialog.dialog_title') }}</h3>
      <p>{{ t('no_ide_path_dialog.dialog_desc') }}</p>
      <div m="t-20px b-5px" flex="~ row-reverse" gap="10px">
        <JeButton order-2 @click="changeSettingsView">
          {{ t('no_ide_path_dialog.set') }}
        </JeButton>
        <JeButton type="secondary" order-1 @click="hideNoIdePathDialog">
          {{ t('no_ide_path_dialog.cancel') }}
        </JeButton>
      </div>
    </JePopup>
  </div>
</template>
