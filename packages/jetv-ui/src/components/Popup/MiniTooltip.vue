<script lang="ts" setup>
import type { JeMiniTooltipProps } from './types'

defineProps<JeMiniTooltipProps>()
</script>

<template>
  <div class="je-mini-tooltip" :class="`je-mini-tooltip--${state}`">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.je-mini-tooltip {
  @apply font-sans text-13px lh-26px;
  @apply b-solid b-1px px-5px;

  &--error {
    // light
    @apply light:b-$red-6 light:bg-$red-10;

    // dark
    @apply dark:b-$red-4 dark:bg-$red-1;
  }
}
</style>
