<script setup lang="ts">
</script>

<template>
  <span relative>
    <input input w="[calc(100%-16px)]">
    <span
      absolute
      p="2px" rounded-2px
      right="7px" top="50%" translate-y="-50%"
      bg="hover:$hover-1 active:$active-1"
      icon="folder"
    />
  </span>
</template>
