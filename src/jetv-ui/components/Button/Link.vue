<script lang="ts" setup>
import type { LinkProps } from './types'

withDefaults(defineProps<LinkProps>(), {
  type: 'internal',
  disabled: false,
})

function handleActionClick(func?: () => void, disabled = false) {
  if (!disabled && func) {
    func()
  }
}
</script>

<template>
  <span
    class="je-link"
    :class="[`je-link--${type}`, { 'je-link--disabled': disabled }]"
    :tabindex="disabled ? -1 : 0"
    @click="handleActionClick(onClick, disabled)"
    @keydown.enter="handleActionClick(onClick, disabled)"
  >
    <slot />
    <!-- Icon -->
    <span
      v-if="type !== 'internal'"
      :class="{
        'je-link__icon--web': type === 'web',
        'je-link__icon--options': type === 'options',
      }"
    />
  </span>
</template>

<style lang="scss" scoped>
.je-link {
  @apply font-sans text-13px lh-16px;
  @apply inline-flex items-center;
  @apply outline-none;
  @apply decoration-none underline-offset-2px;
  @apply cursor-pointer;

  // 默认类型样式
  &:not(&--disabled) {
    @apply light:color-$blue-2 dark:color-$blue-9;
    @apply hover:decoration-underline focus-visible:decoration-underline;
  }

  // 禁用状态样式
  &--disabled {
    @apply light:color-$gray-8 dark:color-$gray-7;
  }
}

.je-link__icon {
  @apply text-0.8rem;

  // Web 类型样式
  &--web {
    @apply light:i-jet:external-link dark:i-jet:external-link-dark;
  }

  // Options 类型样式
  &--options {
    @apply light:i-jet:chevron-down dark:i-jet:chevron-down-dark;
  }
}
</style>
