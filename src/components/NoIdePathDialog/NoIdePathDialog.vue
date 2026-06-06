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
  <DialogRoot
    :open="isDialogVisible"
    @update:open="open => !open && hideNoIdePathDialog()"
  >
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-content">
        <DialogTitle class="dialog-title">
          {{ t('no_ide_path_dialog.dialog_title') }}
        </DialogTitle>
        <DialogDescription class="dialog-description">
          {{ t('no_ide_path_dialog.dialog_desc') }}
        </DialogDescription>

        <div class="dialog-actions">
          <button class="primary-button" type="button" @click="changeSettingsView">
            {{ t('no_ide_path_dialog.set') }}
          </button>
          <button class="ghost-button" type="button" @click="hideNoIdePathDialog">
            {{ t('no_ide_path_dialog.cancel') }}
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

.dialog-actions {
  @apply mt-20px flex flex-row-reverse gap-8px;
}

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
