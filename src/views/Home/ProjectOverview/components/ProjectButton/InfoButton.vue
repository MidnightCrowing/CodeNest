<template>
  <span
    rounded="4px"
    p="x-10px y-5px"
    bg="hover:$hover-2 active:$active-2" color="gray-400 hover:$text-color-2"
    flex="~ row items-center"
    cursor-default truncate
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <slot />
  </span>
</template>
