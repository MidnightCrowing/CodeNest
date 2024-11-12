<script lang="ts" setup>
import type { InputField } from './type'

withDefaults(defineProps<InputField>(), {
  validated: false,
  disabled: false,
})

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <input
    class="je-input-field"
    :class="{ validated }"
    :disabled="disabled"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<style lang="scss" scoped>
.je-input-field {
  @apply font-sans;
  @apply m-2px b-0 px-6px py-5px rounded-3px;
  @apply min-w-64px;
  @apply outline outline-2px;

  // Default 状态样式
  &:not(:disabled) {
    // light
    @apply light:color-$gray-1 light:bg-$gray-14;
    @apply light:outline-$gray-9 light:focus:outline-$blue-4;

    // dark
    @apply dark:color-$gray-12 dark:bg-$gray-2;
    @apply dark:outline-$gray-5 dark:focus:outline-$blue-6;
  }

  // Validated 状态样式
  &.validated:not(:disabled) {
    // light
    @apply light:outline-$red-9 light:focus:outline-$red-4;

    // dark
    @apply dark:outline-$red-2 dark:focus:outline-$red-6;
  }

  // 禁用状态样式
  &:disabled {
    // light
    @apply light:color-$gray-8 light:bg-$gray-13 light:outline-$gray-11;

    // dark
    @apply dark:color-$gray-7 dark:bg-$gray-2 dark:outline-$gray-5;
  }
}
</style>
