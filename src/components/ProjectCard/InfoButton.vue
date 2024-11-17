<template>
  <span
    p="x-10px y-5px" rounded="4px"
    hover:bg="light:$gray-9 dark:$gray-6" active:opacity-70
    flex="~ row items-center"
    cursor-default truncate
    @mousedown.stop @mouseup.stop
  >
    <slot />
  </span>
</template>
