<template>
  <span class="je-loader loader-icon" />
</template>

<style lang="scss" scoped>
.je-loader.loader-icon {
  @apply animate-spin;

  @apply light:i-jet:loader dark:i-jet:loader-dark;
  @apply light:size-1rem dark:size-1rem;
}
</style>
