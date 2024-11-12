<script lang="ts" setup>
import { JeButton } from './index'
import type { SlimButton } from './type'

withDefaults(defineProps<SlimButton>(), {
  disabled: false,
})
</script>

<template>
  <JeButton
    class="je-slim-button"
    type="secondary"
    :disabled="disabled"
  >
    <slot />
  </JeButton>
</template>

<style lang="scss" scoped>
.je-slim-button {
  @apply py-1px;
  @apply outline-offset-0;

  // 禁用状态样式
  &:disabled {
    // light
    @apply light:color-$gray-8 light:bg-$gray-12;

    // dark
    @apply dark:color-$gray-12 dark:bg-$gray-5;
  }
}
</style>
