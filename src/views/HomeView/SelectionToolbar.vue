<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  count: number
}>()

const emit = defineEmits<{
  archive: []
  unarchive: []
  remove: []
  clear: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="selection-toolbar">
    <div class="toolbar-content">
      <span class="selection-count">
        <span class="i-lucide:check" />
        {{ t('app.home.selection.selected', { count: props.count }) }}
      </span>
      <div class="toolbar-actions">
        <button class="ghost-button" type="button" @click="emit('archive')">
          <span class="i-lucide:archive" />
          {{ t('app.home.actions.archive') }}
        </button>
        <button class="ghost-button" type="button" @click="emit('unarchive')">
          <span class="i-lucide:archive-restore" />
          {{ t('app.home.actions.unarchive') }}
        </button>
        <button class="ghost-button danger" type="button" @click="emit('remove')">
          <span class="i-lucide:trash-2" />
          {{ t('app.home.actions.remove') }}
        </button>
      </div>
      <button class="icon-button" type="button" :title="t('app.common.close')" @click="emit('clear')">
        <span class="i-lucide:x" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.selection-toolbar {
  @apply sticky top-0 z-10 px-20px py-10px;
  @apply bg-$ui-background/95;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ui-border);
}

.toolbar-content {
  @apply flex items-center gap-12px;
}

.selection-count {
  @apply flex items-center gap-6px text-13px font-500 color-$ui-foreground;
}

.toolbar-actions {
  @apply flex-1 flex items-center gap-6px;
}

.icon-button {
  @apply shrink-0 size-28px flex items-center justify-center rounded-6px;
  @apply hover:bg-$ui-hover-background;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-$ui-ring;
  transition: background-color 120ms ease;
}
</style>
