<script setup lang="ts">
</script>

<template>
  <div>
    <div m="x-15px y-5px" grid="~ cols-[auto_1fr]" gap="x-5px y-10px">
      <span self-center>名称:</span>
      <input w="200px">
      <span self-center>位置:</span>
      <input grow>
    </div>
  </div>
</template>

<style scoped lang="scss">
input {
  --uno: "bg-transparent color-$text-color-2 placeholder-$text-color-3";
  --uno: "m-2px px-6px py-5px min-w-64px";
  --uno: "border-0 rounded-3px";
  --uno: "outline-solid outline-2px outline-$border-line focus:outline-$active-3";
}
</style>
