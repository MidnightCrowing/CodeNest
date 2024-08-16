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
    bg-transparent
    color="$text-color-2" placeholder-text-comment
    border-0 rounded="3px"
    m="2px" p="x-6px y-5px"
    min-w-64px
    outline="~ 2px $border-line focus:$active-3"
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>
