<template>
  <div class="je-group-header">
    <slot />
    <hr>
  </div>
</template>

<style lang="scss" scoped>
.je-group-header {
  @apply font-sans text-13px lh-25px;
  @apply mx-5px;
  @apply flex items-center gap-8px;

  @apply light:color-$gray-1 dark:color-$gray-12;

  hr {
    @apply flex-grow h-1px b-0;
    @apply light:bg-$gray-12 dark:bg-$gray-3;
  }
}
</style>
