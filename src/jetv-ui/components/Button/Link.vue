<script lang="ts" setup>
import type { Action, Link } from './type'

withDefaults(defineProps<Link>(), {
  type: 'internal',
  disabled: false,
})

function handleActionClick(action: Action) {
  if (action.onClick) {
    action.onClick()
  }
}
</script>

<template>
  <span
    class="je-link"
    :class="{ type, disabled }"
    @click="handleActionClick(action)"
  >
    <slot />

    <!-- Icon -->
    <span
      v-if="type !== 'internal'"
      :class="type === 'web' ? 'external-link-icon' : type === 'options' ? 'chevron-down-icon' : ''"
    />
  </span>
</template>

<style lang="scss" scoped>
.je-link {
  @apply font-sans text-13px lh-25px;
  @apply inline-flex items-end;
  @apply decoration-none underline-offset-2px;
  @apply cursor-pointer;

  // Default 类型样式
  &:not(.disabled) {
    @apply light:color-$blue-2 dark:color-$blue-9;
    @apply hover:decoration-underline;
  }

  // Web 类型样式
  .external-link-icon {
    @apply text-17px;

    @apply light:i-jet:external-link dark:i-jet:external-link-dark;
  }

  // Options 类型样式
  .chevron-down-icon {
    @apply text-17px;

    @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
  }

  // 禁用状态样式
  &.disabled {
    @apply light:color-$gray-8 dark:color-$gray-7;
  }
}
</style>
