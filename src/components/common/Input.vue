<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="modelValue"
    input
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>
