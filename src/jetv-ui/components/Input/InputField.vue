<script lang="ts" setup>
import { JeMiniTooltip } from '../Popup'
import type { JeInputFieldProps } from './types'

withDefaults(defineProps<JeInputFieldProps>(), {
  validated: false,
  disabled: false,
})
defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div
    class="je-input-field"
    :class="{
      'je-input-field--validated': validated,
      'je-input-field--disabled': disabled,
    }"
  >
    <input
      class="je-input-field__input"
      :disabled="disabled"
      :value="modelValue"
      :tabindex="tabindex"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <JeMiniTooltip
      v-if="validatedTooltip"
      class="je-input-field__tooltip"
      state="error"
    >
      {{ validatedTooltip }}
    </JeMiniTooltip>
  </div>
</template>

<style lang="scss" scoped>
.je-input-field {
  @apply relative;

  // Default 状态样式
  &:not(&--disabled) &__input {
    // light
    @apply light:color-$gray-1 light:bg-$gray-14;
    @apply light:outline-$gray-9 light:focus:outline-$blue-4;

    // dark
    @apply dark:color-$gray-12 dark:bg-$gray-2;
    @apply dark:outline-$gray-5 dark:focus:outline-$blue-6;
  }

  // Validated 状态样式
  &--validated:not(&--disabled) &__input {
    // light
    @apply light:outline-$red-9 light:focus:outline-$red-4;

    // dark
    @apply dark:outline-$red-2 dark:focus:outline-$red-6;
  }

  // 禁用状态样式
  &--disabled &__input {
    // light
    @apply light:color-$gray-8 light:bg-$gray-13 light:outline-$gray-11;

    // dark
    @apply dark:color-$gray-7 dark:bg-$gray-2 dark:outline-$gray-5;
  }

  &--validated &__input:hover + &__tooltip {
    @apply visible;
  }
}

.je-input-field__input {
  @apply font-sans text-13px;
  @apply m-2px b-0 px-6px py-5px rounded-3px;
  @apply w-full min-w-64px box-border;
  @apply outline outline-2px;
}

.je-input-field__tooltip {
  @apply absolute z-2 translate-y-1px;
  @apply invisible;
}
</style>
