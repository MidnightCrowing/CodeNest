<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps<{
  isUpdate: boolean
  canSave: boolean
  duplicatePath: boolean
}>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const { t } = useI18n()
</script>

<template>
  <header
    class="editor-topbar"
    shrink-0 px-14px py-10px
    grid items-center gap-10px
    grid-cols="[auto_minmax(0,1fr)_auto]"
  >
    <button
      class="icon-button"
      light:bg-transparent dark:bg-transparent hover:bg="$ui-hover-background"
      type="button"
      :title="t('app.common.back')"
      :aria-label="t('app.common.back')"
      @click="emit('close')"
    >
      <span class="i-lucide:chevron-left" text-16px />
    </button>

    <div min-w-0 flex items-center>
      <h1 m-0 text-17px lh-21px font-600>
        {{ isUpdate ? t('app.project_editor.title.edit') : t('app.project_editor.title.add') }}
      </h1>
    </div>

    <div class="topbar-actions" flex items-center gap-7px>
      <button class="ghost-button" type="button" @click="emit('close')">
        {{ t('app.common.cancel') }}
      </button>
      <button class="primary-button" type="button" :disabled="!canSave || duplicatePath" @click="emit('save')">
        {{ isUpdate ? t('app.project_editor.save_changes') : t('app.project_editor.add_project') }}
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@media (max-width: 680px) {
  .editor-topbar {
    @apply grid-cols-[auto_minmax(0,1fr)] px-10px py-8px;
  }

  .topbar-actions {
    @apply col-span-2 justify-end;
  }
}
</style>
