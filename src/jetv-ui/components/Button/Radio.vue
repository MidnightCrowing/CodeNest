<script lang="ts" setup>
interface Props {
  label: string
  modelValue: string | null
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const isChecked = computed(() => props.modelValue === props.label)

function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
  }
  else if (props.modelValue !== props.label) {
    emit('update:modelValue', props.label)
  }
}
</script>

<template>
  <label
    class="je-radio-input"
    :class="[{ checked: isChecked, disabled }]"
    tabindex="0"
    @click="handleClick"
  >
    <span class="radio-mark" />
    <input
      type="radio"
      class="radio-input"
      :value="label"
      :checked="isChecked"
      :disabled="disabled"
      @change="$emit('change', label)"
    >
    <span class="radio-label">{{ label }}</span>
  </label>
</template>

<style lang="scss" scoped>
.je-radio-input {
  @apply flex items-center;
  @apply cursor-pointer;

  // 未选中样式
  .radio-mark {
    @apply size-1rem shrink-0;
    @apply b-solid b-0.3rem b-transparent rounded-1/2 box-border;
    @apply outline outline-1px;

    // light
    @apply light:bg-$gray-14 light:outline-$gray-8;

    // dark
    @apply dark:bg-$gray-2 dark:outline-$gray-6;
  }

  &:hover:not(.disabled) .radio-mark {
    @apply light:outline-$gray-6 dark:outline-$gray-9;
  }

  &:focus:not(.disabled) .radio-mark {
    @apply outline-2px;

    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }

  // 选中样式
  &.checked:not(.disabled) .radio-mark {
    @apply outline-none;

    // light
    @apply light:bg-$gray-14 light:b-$blue-4;

    // dark
    @apply dark:bg-$gray-14 dark:b-$blue-6;
  }

  &.checked:hover:not(.disabled) .radio-mark {
    @apply outline-none;

    @apply light:b-$blue-3 dark:b-$blue-5;
  }

  &.checked:focus:not(.disabled) .radio-mark {
    @apply outline-offset-1px;

    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }

  // 禁用状态样式
  &.disabled .radio-mark {
    // light
    @apply light:bg-$gray-13 light:outline-$gray-11;

    // dark
    @apply dark:bg-$gray-3 dark:outline-$gray-6;
  }

  &.disabled.checked .radio-mark {
    // light
    @apply light:bg-$gray-9 light:b-$gray-13;

    // dark
    @apply dark:bg-$gray-7 dark:b-$gray-3;
  }

  .radio-input {
    @apply hidden;
  }

  .radio-label {
    @apply font-sans text-13px lh-25px ml-2;
  }

  &.disabled .radio-label {
    @apply light:color-$gray-8 dark:color-$gray-7;
  }
}
</style>
