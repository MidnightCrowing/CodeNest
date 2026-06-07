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

<style lang="scss" scoped>
.primary-button,
.ghost-button {
  @apply h-28px border-0 rounded-5px px-10px;
  @apply inline-flex items-center justify-center gap-5px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.primary-button {
  @apply bg-$ui-primary color-$ui-primary-foreground;
  @apply hover:bg-$ui-primary-hover active:bg-$ui-primary-active;
}

.ghost-button {
  @apply bg-$ui-control-background color-$ui-foreground;
  @apply hover:bg-$ui-hover-background;
}
</style>
