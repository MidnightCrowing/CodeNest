<script setup lang="ts">
import { JeCard } from './index'
</script>

<template>
  <JeCard class="simple">
    <slot />
  </JeCard>
</template>

<style lang="scss" scoped>
.je-card.simple {
  @apply light:bg-transparent dark:bg-transparent;

  // light
  @apply light:bg-transparent light:hover:bg-$gray-13;

  // dark
  @apply dark:bg-transparent dark:hover:bg-$gray-2;
}
</style>
