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
      size-20px
      bg="theme-chbRb-bg checked:!theme-chbRb-bgActive"
      b="solid 2px theme-chbRb-border focus:theme-chbRb-borderFocused checked:transparent" m-0
      rounded="4px"
      outline="~ 2px transparent checked:focus:theme-chbRb-borderActive" outline-offset="1px"
      i-static="checked:checkbox-checked"
    >
    {{ title }}
  </label>
</template>
