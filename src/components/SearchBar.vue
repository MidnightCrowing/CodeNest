<script setup lang="ts">
</script>
<!-- flex="~ row items-center" -->

<template>
  <span
    relative h="26px" overflow-hidden
  >
    <span
      m="x-3px y-auto" absolute top-0 bottom-0 left-0
      pointer-events-none
      i-custom:search dark:i-custom:search_dark
    />
    <input
      bg-transparent color="$text-color-2"
      border-none outline-none shadow-none
      h-full w="[calc(100%-50px)]" p="x-25px"
      placeholder="请输入文字"
    >
    <span
      m="x-3px y-auto" absolute top-0 bottom-0 right-0
      cursor-pointer
      dark:i-custom:closeSmall
    />
  </span>
</template>
