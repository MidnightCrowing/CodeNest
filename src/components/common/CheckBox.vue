<script setup lang="ts">
defineProps<{
  title: string
}>()
// const isChecked = ref(false)
//
// function toggleCheck() {
//   isChecked.value = !isChecked.value
// }
</script>

<template>
  <!--  <div class="custom-checkbox" @click="toggleCheck" /> -->
  <label flex="~ items-center" gap="x-5px">
    <input type="checkbox" check-box>
    {{ title }}
  </label>
</template>
