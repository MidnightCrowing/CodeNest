<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  error?: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isError = ref(props.error ?? false)

watch(() => props.error, (newValue) => {
  isError.value = newValue
})

function handleFocus() {
  // 取消警告样式
  isError.value = false
}
</script>

<template>
  <input
    :value="modelValue"
    :class="[
      isError ? 'outline-theme-field-borderError' : 'outline-theme-field-border',
    ]"
    bg="theme-field-bg"
    color="theme-text-default placeholder:text-comment"
    m="2px" b-0 p="x-6px y-5px" rounded="3px"
    min-w="64px"
    outline="~ 2px focus:theme-field-borderFocused"
    @input="$emit('update:modelValue', $event.target.value)"
    @focus="handleFocus"
  >
</template>
