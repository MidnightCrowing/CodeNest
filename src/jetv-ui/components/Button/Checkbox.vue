<script lang="ts" setup>
interface Props {
  label: string
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
}
withDefaults(defineProps<Props>(), {
  checked: false,
  indeterminate: false,
  disabled: false,
})
</script>

<template>
  <label class="je-checkbox">
    <input
      class="je-checkbox"
      :class="{ indeterminate }"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
    >
    {{ label }}
  </label>
</template>

<style lang="scss" scoped>
.je-checkbox {
  @apply font-sans text-13px lh-25px;
  @apply flex items-center gap-x-5px;

  // light
  @apply light:bg-$gray-14 light:color-$gray-1;

  // dark
  @apply dark:bg-$gray-2 dark:color-$gray-12;

  input {
    @apply align-middle appearance-none;
    @apply size-20px rounded-4px;
    @apply b-0 m-0;
    @apply outline outline-2px;

    @apply light:outline-$gray-8 dark:outline-$gray-6;

    // 激活状态
    &:not(:disabled) {
      &:not(:checked):hover {
        @apply light:outline-$gray-6 dark:outline-$gray-9;
      }

      &:not(:checked):focus {
        @apply light:outline-$blue-4 dark:outline-$blue-6;
      }

      &:checked {
        @apply outline-none;

        // 选中状态
        &:not(.indeterminate) {
          @apply light:bg-$blue-4 dark:bg-$blue-6;
          @apply i-jet:checked;
          @apply size-20px;
        }

        // Indeterminate 状态
        &.indeterminate {
          @apply light:bg-$blue-4 dark:bg-$blue-6;
          @apply i-jet:remove;
          @apply size-20px;
        }

        &:hover {
          @apply light:bg-$blue-3 dark:bg-$blue-5;
        }

        &:focus {
          @apply outline-offset-1px;
          @apply light:outline-$blue-4 dark:outline-$blue-6;
        }
      }
    }

    // 禁用状态样式
    &:disabled:checked {
      @apply outline-none;

      // 选中状态
      &:not(.indeterminate) {
        @apply light:i-jet:checked dark:i-jet:checked-disabled-dark;
        @apply light:size-20px dark:size-20px;
        @apply light:bg-$gray-9 dark:bg-$gray-3;
      }

      // Indeterminate 状态
      &.indeterminate {
        @apply light:i-jet:remove dark:i-jet:remove-disabled-dark;
        @apply light:size-20px dark:size-20px;
        @apply light:bg-$gray-9 dark:bg-$gray-3;
      }
    }
  }
}
</style>
