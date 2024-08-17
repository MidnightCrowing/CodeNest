<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  warning?: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isWarning = ref(props.warning || false)

watch(() => props.warning, (newValue) => {
  isWarning.value = newValue
})

function handleFocus() {
  // 取消警告样式
  isWarning.value = false
}
</script>

<template>
  <input
    :value="modelValue"
    :class="[
      isWarning ? 'outline-$border-warning' : 'outline-$border-line',
    ]"
    bg-transparent
    color="$text-color-2 placeholder:text-comment"
    m="2px" b-0 p="x-6px y-5px" rounded="3px"
    min-w="64px"
    outline="~ 2px $border-line focus:$active-3"
    @input="$emit('update:modelValue', $event.target.value)"
    @focus="handleFocus"
  >
</template>
