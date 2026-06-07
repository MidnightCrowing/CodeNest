<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h2>{{ title }}</h2>
    </header>

    <div class="settings-list">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  @apply flex flex-col gap-10px;
}

.page-header {
  @apply min-w-0 flex items-end justify-between gap-10px;

  h2 {
    @apply m-0 min-w-0 text-16px font-650;
    overflow-wrap: anywhere;
  }
}

.settings-list {
  @apply flex flex-col gap-8px;
}
</style>
