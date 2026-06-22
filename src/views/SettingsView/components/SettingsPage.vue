<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="settings-page" flex flex-col gap-10px>
    <header
      class="page-header" min-w-0 flex items-end justify-between
      gap-10px
    >
      <h2 m-0 min-w-0 text-16px font-650>
        {{ title }}
      </h2>
    </header>

    <div flex flex-col gap-8px>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  overflow-wrap: anywhere;
}
</style>
