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

  &--subtle {
    @apply light:bg-$gray-12 dark:bg-$gray-3;
    @apply hover:bg-$toolbar-hover active:bg-$toolbar-active;
  }
}
</style>
