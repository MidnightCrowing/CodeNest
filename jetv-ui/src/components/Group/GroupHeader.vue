<script lang="ts" setup>
import { JeLine } from '../Frame'
import type { JeGroupHeaderProps } from './types.ts'

withDefaults(defineProps<JeGroupHeaderProps>(), {
  type: 'primary',
  foldAble: false,
  isFold: false,
})
</script>

<template>
  <div class="je-group-header" :class="`je-group-header--${type}`">
    <slot />
    <JeLine class="je-group-header__line" />
  </div>
</template>

<style lang="scss" scoped>
.je-group-header {
  @apply font-sans text-13px lh-26px;
  @apply mx-5px;
  @apply flex items-center gap-8px;

  // 主样式
  &--primary {
    @apply light:color-$gray-1 dark:color-$gray-12;
  }

  // 次要样式
  &--secondary {
    @apply color-$gray-7;
  }
}

.je-group-header__line {
  @apply grow;
}
</style>
