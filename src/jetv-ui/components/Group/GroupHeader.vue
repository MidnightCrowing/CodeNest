<script lang="ts" setup>
import { JeLine } from './index'
import type { GroupHeader } from './type'

withDefaults(defineProps<GroupHeader>(), {
  type: 'primary',
  foldAble: false,
  isFold: false,
})
</script>

<template>
  <div class="je-group-header" :class="type">
    <slot />
    <JeLine class="header-line" />
  </div>
</template>

<style lang="scss" scoped>
.je-group-header {
  @apply font-sans text-13px lh-25px;
  @apply mx-5px;
  @apply flex items-center gap-8px;

  // 主样式
  &.primary {
    @apply light:color-$gray-1 dark:color-$gray-12;
  }

  // 次要样式
  &.secondary {
    @apply color-$gray-7;
  }

  .header-line {
    @apply grow;
  }
}
</style>
