<script lang="ts" setup>
import JeCard from './Card.vue'
</script>

<template>
  <JeCard class="je-card--simple">
    <slot />
  </JeCard>
</template>

<style lang="scss" scoped>
.je-card--simple {
  // light
  @apply light:bg-transparent light:hover:bg-$gray-13;

  // dark
  @apply dark:bg-transparent dark:hover:bg-$gray-2;
}
</style>
