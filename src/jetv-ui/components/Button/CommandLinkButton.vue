<script lang="ts" setup>
import type { JeCommandLinkButtonProps } from './types'

withDefaults(defineProps<JeCommandLinkButtonProps>(), {
  disabled: false,
})
</script>

<template>
  <div
    class="je-command-link-button"
    :class="{ 'je-command-link-button--disabled': disabled }"
    :tabindex="disabled ? -1 : 0"
  >
    <span class="je-command-link-button__button-inner">
      <span
        v-if="icon"
        class="je-command-link-button__icon" :class="icon"
      />
      <span class="je-command-link-button__text">
        <slot />
      </span>
    </span>
    <span class="je-command-link-button__icon-arrow" />
  </div>
</template>

<style lang="scss" scoped>
.je-command-link-button {
  @apply font-sans text-13px lh-25px;
  @apply px-15px py-7px rounded-7px w-full box-border;
  @apply outline outline-2px outline-transparent;
  @apply flex items-center justify-between gap-10px;
  @apply cursor-default truncate;

  @apply light:bg-$gray-13 dark:bg-$gray-2;

  // 激活状态样式
  &:not(&--disabled) {
    @apply light:hover:bg-$gray-12 light:focus:outline-$blue-4;
    @apply dark:hover:bg-$gray-3 dark:focus:outline-$blue-6;
  }

  // 禁用状态样式
  &--disabled {
    @apply cursor-not-allowed;
    @apply opacity-50;
  }
}

.je-command-link-button__button-inner {
  @apply flex items-center gap-10px;
  @apply overflow-hidden;
}

.je-command-link-button__icon {
  @apply shrink-0;
}

.je-command-link-button__text {
  @apply overflow-hidden text-ellipsis;
}

.je-command-link-button__icon-arrow {
  @apply light:i-jet:drop-down dark:i-jet:drop-down-dark;
  @apply light:size-0.5rem dark:size-0.5rem;
}
</style>
