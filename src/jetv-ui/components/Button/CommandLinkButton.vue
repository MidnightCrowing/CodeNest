<script lang="ts" setup>
import type { CommandLinkButton } from './type'

withDefaults(defineProps<CommandLinkButton>(), {
  disabled: false,
})
</script>

<template>
  <div
    class="je-command-link-button"
    :class="{ disabled }"
    :tabindex="disabled ? -1 : 0"
  >
    <span class="button-content">
      <span
        v-if="icon"
        class="button-icon" :class="icon"
      />
      <span class="button-text">
        <slot />
      </span>
    </span>
    <span class="arrow-icon" />
  </div>
</template>

<style lang="scss" scoped>
.je-command-link-button {
  @apply font-sans text-13px lh-25px;
  @apply px-15px py-7px rounded-7px w-full;
  @apply outline outline-2px outline-transparent;
  @apply flex items-center justify-between gap-10px;
  @apply cursor-default truncate;

  @apply light:bg-$gray-13 dark:bg-$gray-2;

  .button-content {
    @apply flex items-center gap-10px;
    @apply overflow-hidden;

    .button-icon {
      @apply shrink-0;
    }

    .button-text {
      @apply overflow-hidden text-ellipsis;
    }
  }

  .arrow-icon {
    @apply light:i-jet:drop-down dark:i-jet:drop-down-dark;
    @apply light:size-0.5rem dark:size-0.5rem;
  }

  // 激活状态样式
  &:not(.disabled) {
    // light
    @apply light:hover:bg-$gray-12 light:focus:outline-$blue-4;

    // dark
    @apply dark:hover:bg-$gray-3 dark:focus:outline-$blue-6;
  }

  // 禁用状态样式
  &.disabled {
    @apply cursor-not-allowed;
    @apply opacity-50;
  }
}
</style>
