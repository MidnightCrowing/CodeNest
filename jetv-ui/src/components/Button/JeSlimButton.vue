<script lang="ts" setup>
import JeButton from './JeButton.vue'
import type { JeSlimButtonProps } from './types.ts'

withDefaults(defineProps<JeSlimButtonProps>(), {
  type: 'default',
  disabled: false,
})
</script>

<template>
  <JeButton
    class="slim"
    :type="type === 'alt' ? 'secondary-alt' : 'secondary'"
    :disabled="disabled"
  >
    <slot />
  </JeButton>
</template>

<style lang="scss" scoped>
.slim {
  @apply py-1px;
  @apply outline-offset--1px;

  // 禁用状态样式
  &:disabled {
    @apply light:color-$gray-8 light:bg-$gray-12;
    @apply dark:color-$gray-12 dark:bg-$gray-5;
  }
}
</style>
