<script lang="ts" setup>
import { JeFrame } from '../index'
</script>

<template>
  <JeFrame class="je-popup">
    <slot />
  </JeFrame>
</template>

<style lang="scss" scoped>
.je-popup {
  @apply relative z-1;
  @apply b-solid b-1px rounded-5px;
  @apply shadow-$shadow-popup;

  // light
  @apply light:bg-$gray-14 light:b-$gray-9;

  // dark
  @apply dark:bg-$gray-2 dark:b-$gray-3;
}
</style>
