<script lang="ts" setup>
import { capitalize } from '../../utils/common'
import type { JeShortcutProps } from './types.ts'

withDefaults(defineProps<JeShortcutProps>(), {
  type: 'default',
})
</script>

<template>
  <div class="je-shortcut" :class="`je-shortcut--${type}`">
    <span
      v-for="(key, index) in keys"
      :key="index"
      class="je-shortcut__key"
    >
      {{ capitalize(key) }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.je-shortcut {
  @apply font-mono text-13px;
  @apply flex items-center gap-3px;
  @apply outline-none;
  @apply light:color-$gray-1 dark:color-$gray-12;

  &--default .je-shortcut__key {
    @apply light:bg-$gray-11 dark:bg-$gray-5;
  }

  &--outline .je-shortcut__key {
    @apply light:b-$gray-11 dark:b-$gray-5;
  }
}

.je-shortcut__key {
  @apply b-solid b-2px b-transparent box-border;
  @apply px-7px py-1px rounded-4px;
}
</style>
