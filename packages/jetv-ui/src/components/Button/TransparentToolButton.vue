<script lang="ts" setup>
import type { JeTransparentToolButtonProps } from './types'

withDefaults(defineProps<JeTransparentToolButtonProps>(), {
  disabled: false,
})
</script>

<template>
  <div class="je-transparent-tool-button" :tabindex="0">
    <span
      class="je-transparent-tool-button__icon"
      :class="icon"
      :style="{ fontSize: iconSize ?? '0.9rem' }"
    />
  </div>
</template>

<style lang="scss" scoped>
.je-transparent-tool-button {
  @apply flex items-center justify-center;
  @apply w-fit size-min-1.25rem rounded-4px;
  @apply hover:bg-$toolbar-hover active:bg-$toolbar-active;
  @apply focus-visible:bg-$toolbar-hover focus-visible:outline-0;
  @apply cursor-default;
}
</style>
