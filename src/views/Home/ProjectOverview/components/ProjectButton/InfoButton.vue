<template>
  <span
    p="x-10px y-5px" rounded="4px"
    hover:bg="$hover-2" active:bg="$active-2"
    flex="~ row items-center"
    text-gray-400 hover:text="$text-color-2"
    cursor-default truncate
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <slot />
  </span>
</template>
