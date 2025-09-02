<template>
  <div class="je-card">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.je-card {
  @apply text-default;
  @apply rounded-4px;
  @apply transition-all duration-150;

  // light
  @apply light:bg-$gray-12 light:hover:bg-$gray-11;

  // dark
  @apply dark:bg-$gray-3 dark:hover:bg-$gray-4;
}
</style>
