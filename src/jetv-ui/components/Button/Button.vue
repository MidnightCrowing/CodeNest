<script lang="ts" setup>
import type { Button } from './type'

withDefaults(defineProps<Button>(), {
  type: 'primary',
  disabled: false,
})
</script>

<template>
  <button
    class="je-button"
    :class="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.je-button {
  @apply font-sans text-13px lh-25px;
  @apply color-$gray-14;
  @apply outline outline-2px outline-none;
  @apply px-14px py-3px b-0 rounded-4px;
  @apply min-w-72px;

  // Primary 按钮类型样式
  &.primary:not(:disabled) {
    @apply outline-offset-1px;

    // light
    @apply light:bg-$blue-4 light:hover:bg-$blue-3 light:active:bg-$blue-2 light:focus:bg-$blue-4;
    @apply light:focus:outline-$blue-4;

    // dark
    @apply dark:bg-$blue-6 dark:hover:bg-$blue-5 dark:active:bg-$blue-4 dark:focus:bg-$blue-6;
    @apply dark:focus:outline-$blue-6;
  }

  // Secondary 按钮类型样式
  &.secondary:not(:disabled) {
    @apply outline-offset-0;

    // light
    @apply light:color-$gray-1;
    @apply light:bg-$gray-14 light:active:bg-$gray-13;
    @apply light:outline-$gray-9 light:hover:outline-$gray-8 light:active:outline-$gray-7 light:focus:outline-$blue-4;

    // dark
    @apply dark:color-$gray-12;
    @apply dark:bg-$gray-1  dark:active:bg-$gray-2 dark:focus:bg-$gray-2;
    @apply dark:outline-$gray-5 dark:hover:outline-$gray-7 dark:active:outline-$gray-7 dark:focus:outline-$blue-6;
  }

  // 禁用状态样式
  &:disabled {
    @apply color-$gray-8;

    @apply light:bg-$gray-12 dark:bg-$gray-5;
  }
}
</style>
