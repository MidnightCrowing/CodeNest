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

    <input
      type="checkbox"
      align-middle
      appearance-none
      bg="transparent checked:!$active-3"
      size-20px m-0
      border="solid 2px $border-1 focus:$border-2 checked:transparent" rounded="4px"
      outline="~ 2px transparent checked:focus:$active-3" outline-offset="1px"
      i-mode="checked:checkbox-checked"
    >
    {{ title }}
  </label>
</template>
