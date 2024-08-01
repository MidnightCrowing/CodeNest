<script setup lang="ts">
</script>

<template>
  <span relative>
    <input input w="[calc(100%-16px)]">
    <span
      absolute
      p="2px" rounded-2px
      right="7px" top="50%" translate-y="-50%"
      hover:bg="$hover-1" active:bg="$active-1"
      i-custom="folder dark:folder_dark"
    />
  </span>
</template>
