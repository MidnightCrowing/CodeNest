<script lang="ts" setup>
import type { JeRadioProps } from './types'

const props = withDefaults(defineProps<JeRadioProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const isChecked = computed(() => props.modelValue === props.value)

function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
  }
  else if (props.modelValue !== props.value) {
    emit('update:modelValue', props.value)
  }
}
</script>

<template>
  <label
    class="je-radio-input"
    :class="{
      'je-radio-input--checked': isChecked,
      'je-radio-input--disabled': disabled,
    }"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
  >
    <span class="je-radio-input__mark" />
    <span class="je-radio-input__label">
      <slot />
    </span>
  </label>
</template>

<style lang="scss" scoped>
.je-radio-input {
  @apply flex items-center;
  @apply cursor-pointer;

  // 未选中样式
  &__mark {
    @apply size-1rem shrink-0;
    @apply b-solid b-0.3rem b-transparent rounded-1/2 box-border;
    @apply outline outline-1px;

    // light
    @apply light:bg-$gray-14 light:outline-$gray-8;

    // dark
    @apply dark:bg-$gray-2 dark:outline-$gray-6;
  }

  &:not(&--disabled):hover &__mark {
    @apply light:outline-$gray-6 dark:outline-$gray-9;
  }

  &:not(&--disabled):focus &__mark {
    @apply outline-2px;

    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }

  // 选中样式
  &--checked:not(&--disabled) &__mark {
    @apply outline-none;

    @apply light:bg-$gray-14 light:b-$blue-4;
    @apply dark:bg-$gray-14 dark:b-$blue-6;
  }

  &--checked:not(&--disabled):hover &__mark {
    @apply outline-none;

    @apply light:b-$blue-3 dark:b-$blue-5;
  }

  &--checked:not(&--disabled):focus &__mark {
    @apply outline-offset-1px;

    @apply light:outline-$blue-4 dark:outline-$blue-6;
  }

  // 禁用状态样式
  &--disabled &__mark {
    @apply light:bg-$gray-13 light:outline-$gray-11;
    @apply dark:bg-$gray-3 dark:outline-$gray-6;
  }

  &--disabled.je-radio-input--checked &__mark {
    @apply light:bg-$gray-9 light:b-$gray-13;
    @apply dark:bg-$gray-7 dark:b-$gray-3;
  }
}

.je-radio-input__label {
  @apply font-sans text-13px lh-26px;
  @apply ml-2;

  .je-radio-input--disabled & {
    @apply light:color-$gray-8 dark:color-$gray-7;
  }
}
</style>
