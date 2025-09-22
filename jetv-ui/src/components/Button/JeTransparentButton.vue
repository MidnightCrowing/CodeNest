<script lang="ts" setup>
import type { JeTransparentButtonProps } from './types.ts'

withDefaults(defineProps<JeTransparentButtonProps>(), {
  type: 'default',
  disabled: false,
})
</script>

<template>
  <button
    class="je-transparent-button"
    :class="`je-transparent-button--${type}`"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.je-transparent-button {
  @apply font-sans text-13px lh-26px;
  @apply light:color-$gray-1 dark:color-$gray-12;
  @apply bg-transparent hover:bg-$toolbar-hover active:bg-$toolbar-active;
  @apply focus-visible:bg-$toolbar-hover;
  @apply outline outline-2px outline-none;
  @apply px-14px py-3px b-0 rounded-4px;
  @apply min-w-72px;

  // subtle variant base
  &--subtle {
    @apply light:bg-$gray-12 dark:bg-$gray-3 hover:bg-$toolbar-hover active:bg-$toolbar-active;
  }

  // Disabled state (applies to all variants)
  &:disabled {
    @apply cursor-not-allowed;
    @apply hover:bg-transparent active:bg-transparent focus-visible:bg-transparent; // no hover/active visuals
    @apply light:color-$gray-8 dark:color-$gray-6; // muted label color
    @apply opacity-70; // soften a bit
  }

  // Variant-specific disabled tweaks
  &--subtle:disabled {
    @apply light:bg-$gray-13 dark:bg-$gray-2; // keep a faint background in subtle disabled
  }
}
</style>
