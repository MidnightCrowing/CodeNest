<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <input
    :value="modelValue"
    input-default
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>
