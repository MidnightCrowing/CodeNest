<script setup lang="ts">
defineProps<{
  use: boolean
}>()
</script>

<template>
  <span
    p="x-10px y-5px" rounded="4px"
    hover:bg="$hover-2"
    flex="~ row items-center"
    text-gray-400 hover:text="$text-color-2" cursor-default
    fill-gray-400 hover:fill="$text-color-2"
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <slot />
  </span>
</template>
