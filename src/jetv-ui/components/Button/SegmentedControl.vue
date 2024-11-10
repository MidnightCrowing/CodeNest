<script lang="ts" setup>
import { JeSlimButton } from './index'

interface Props {
  modelValue: string
  values: { label: string, index: string }[]
  disabled?: boolean
}
withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', index: string): void
}>()

function handleClick(index: string) {
  emit('update:modelValue', index)
}
</script>

<template>
  <div
    class="je-segmented-control"
    :class="{ disabled }"
  >
    <JeSlimButton
      v-for="(value, index) in values"
      :key="index"
      class="button"
      :class="{ selected: modelValue === value.index }"
      :disabled="disabled"
      @click="handleClick(value.index)"
    >
      {{ value.label }}
    </JeSlimButton>
  </div>
</template>

<style lang="scss" scoped>
.je-segmented-control {
  @apply inline-flex gap-x-2px;
  @apply w-fit rounded-4px;
  @apply outline outline-2px;

  // 激活状态
  &:not(.disabled) {
    // light
    @apply light:bg-$gray-13 light:outline-$gray-9;

    // dark
    @apply dark:bg-$gray-2 dark:outline-$gray-5;

    // &:focus-within {
    //   // light
    //   @apply light:outline-$blue-8;
    //
    //   // dark
    //   @apply dark:outline-$blue-4;
    // }

    .button {
      @apply outline-0;

      @apply light:bg-$gray-13 dark:bg-$gray-2;

      // Hovered 状态
      &:hover {
        @apply outline-2px;
        @apply z-0;

        @apply light:outline-$gray-9 dark:outline-$gray-5;
      }

      // Focused 状态
      &:focus {
        @apply outline-2px;
        @apply z-2;

        @apply light:outline-$blue-4 dark:outline-$blue-6;
      }

      // 选中状态
      &.selected {
        @apply outline-2px;
        @apply z-1;

        // light
        @apply light:bg-$gray-14 light:outline-$gray-9;

        // dark
        @apply dark:bg-$gray-3 dark:outline-$gray-7;
      }
    }
  }

  // 禁用状态样式
  &.disabled {
    // light
    @apply light:bg-$gray-14 light:outline-$gray-9;

    // dark
    @apply dark:bg-$gray-2 dark:outline-$gray-5;

    .button {
      @apply outline-0;

      // light
      @apply light:bg-$gray-14;

      // dark
      @apply dark:bg-$gray-2 dark:color-$gray-8;

      // 选中状态
      &.selected {
        @apply outline-2px;
        @apply z-1;

        // light
        @apply light:bg-$gray-12 light:outline-$gray-9;

        // dark
        @apply dark:bg-$gray-5 dark:outline-$gray-5;
      }
    }
  }
}
</style>
