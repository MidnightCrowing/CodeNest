<script setup lang="ts">
import type { JeLineProps } from './types.ts'

withDefaults(defineProps<JeLineProps>(), {
  vertical: false,
})
</script>

<template>
  <hr class="je-line" :class="{ vertical }">
</template>

<style lang="scss" scoped>
.je-line {
  @apply min-h-1px b-0;

  @apply light:bg-$gray-12 dark:bg-$gray-3;

  &.vertical {
    @apply min-h-unset min-w-1px;
  }
}
</style>
