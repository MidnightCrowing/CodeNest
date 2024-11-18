<template>
  <div class="je-card">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.je-card {
  @apply p-3px rounded-4px;
  @apply transition-all;

  // light
  @apply light:bg-$gray-13 light:hover:bg-$gray-12;

  // dark
  @apply dark:bg-$gray-2 dark:hover:bg-$gray-3;
}
</style>
