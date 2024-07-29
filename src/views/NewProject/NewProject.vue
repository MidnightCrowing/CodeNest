<script setup lang="ts">
import PathInput from '~/components/PathInput/PathInput.vue'
</script>

<template>
  <div>
    <div m="x-15px y-5px" grid="~ cols-[auto_1fr]" gap="x-5px y-10px">
      <span self-center>名称:</span>
      <input input w="200px">
      <span self-center>位置:</span>
      <PathInput grow />
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
