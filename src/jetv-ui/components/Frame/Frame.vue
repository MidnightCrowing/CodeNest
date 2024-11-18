<script lang="ts" setup>
import type { Frame } from './type'

withDefaults(defineProps<Frame>(), {
  type: 'primary',
})
</script>

<template>
  <div class="je-frame" :class="type">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.je-frame {
  @apply font-sans text-13px lh-16px font-medium;

  @apply light:color-$gray-1 dark:color-$gray-12;

  &.primary {
    @apply light:bg-$gray-14 dark:bg-$gray-1;
  }

  &.secondary {
    @apply light:bg-$gray-13 dark:bg-$gray-2;
  }

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    @apply w-8px; // 滚动条的宽度
    @apply h-8px; // 横向滚动条的高度
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-corner {
    @apply bg-transparent;
  }
  &::-webkit-scrollbar-track-piece {
    @apply bg-transparent;
  }

  &::-webkit-scrollbar-thumb {
    @apply rounded-full;
    @apply light:bg-#D9D9D9 hover:light:bg-#7B7C7D;
    @apply dark:bg-#48494B hover:dark:bg-#595A5C;
  }
}
</style>
