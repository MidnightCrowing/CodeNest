<template>
  <span
    rounded="4px"
    p="x-10px y-5px"
    hover-bg="[#6e6e6e33] dark:[#6e6e6ecc]"
    active-bg="[#5151514d] active:dark:[#51515180]"
    color="theme-text-infoInput hover:theme-text-default"
    flex="~ row items-center"
    cursor-default truncate
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <slot />
  </span>
</template>
