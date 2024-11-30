<script lang="ts" setup>
import type { JeCheckBoxProps } from './types'

withDefaults(defineProps<JeCheckBoxProps>(), {
  indeterminate: false,
  disabled: false,
})
const emit = defineEmits(['update:modelValue'])

const isChecked = ref(false)

function handleChange(event: Event) {
  const input = event.target as HTMLInputElement
  isChecked.value = input.checked
  emit('update:modelValue', isChecked.value) // 触发更新事件
}
</script>

<template>
  <label class="je-checkbox">
    <input
      class="je-checkbox__input"
      :class="{ 'je-checkbox__input--indeterminate': indeterminate }"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    >
    <slot />
  </label>
</template>

<style lang="scss" scoped>
.je-checkbox {
  @apply font-sans text-13px lh-26px;
  @apply flex items-center gap-x-5px;

  @apply light:color-$gray-1 dark:color-$gray-12;
}

.je-checkbox__input {
  @apply align-middle appearance-none;
  @apply size-20px rounded-4px;
  @apply b-0 m-0;
  @apply outline outline-2px;

  @apply light:bg-$gray-14 light:outline-$gray-8;
  @apply dark:bg-$gray-2 dark:outline-$gray-6;
}

// 激活状态
.je-checkbox__input:not(:disabled) {
  &:not(:checked) {
    @apply light:hover:outline-$gray-6 light:focus:outline-$blue-4;
    @apply dark:hover:outline-$gray-9 dark:focus:outline-$blue-6;
  }

  &:checked {
    @apply text-20px;
    @apply outline-none;
    @apply focus:outline-offset-1px;

    @apply light:hover:bg-$blue-3 light:focus:outline-$blue-4;
    @apply dark:hover:bg-$blue-5 dark:focus:outline-$blue-6;

    // 选中状态
    &:not(.je-checkbox__input--indeterminate) {
      @apply light:bg-$blue-4 dark:bg-$blue-6;
      @apply i-jet:checked;
    }

    // Indeterminate 状态
    &.je-checkbox__input--indeterminate {
      @apply light:bg-$blue-4 dark:bg-$blue-6;
      @apply i-jet:remove;
    }
  }
}

// 禁用状态样式
.je-checkbox__input:disabled:checked {
  @apply outline-none text-20px;

  // 选中状态
  &:not(.je-checkbox__input--indeterminate) {
    @apply light:i-jet:checked dark:i-jet:checked-disabled-dark;
    @apply light:bg-$gray-9 dark:bg-$gray-3;
  }

  // Indeterminate 状态
  &.je-checkbox__input--indeterminate {
    @apply light:i-jet:remove dark:i-jet:remove-disabled-dark;
    @apply light:bg-$gray-9 dark:bg-$gray-3;
  }
}
</style>
