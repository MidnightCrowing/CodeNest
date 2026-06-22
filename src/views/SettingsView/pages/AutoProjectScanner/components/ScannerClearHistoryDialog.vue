<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiDialog from '~/components/ui/UiDialog.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  clear: []
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
</script>

<template>
  <UiDialog
    :open="open"
    :title="t('app.settings.scanner.history.dialog_title')"
    :description="t('app.settings.scanner.history.dialog_desc')"
    width="320px"
    actions-layout="end"
    @update:open="emit('update:open', $event)"
  >
    <template #actions>
      <button class="ghost-button" type="button" @click="emit('update:open', false)">
        {{ t('app.common.cancel') }}
      </button>
      <button class="danger-button" type="button" @click="emit('clear')">
        {{ t('app.common.clear') }}
      </button>
    </template>
  </UiDialog>
</template>
