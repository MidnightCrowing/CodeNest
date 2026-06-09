<script lang="ts" setup>
import {
  ToggleGroupItem,
  ToggleGroupRoot,
} from 'reka-ui'

export interface UiSegmentedControlOption {
  value: string
  label: string
  icon?: string
  tooltip?: string
  disabled?: boolean
}

defineProps<{
  modelValue: string
  options: UiSegmentedControlOption[]
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function updateValue(value: unknown) {
  if (typeof value === 'string' && value)
    emit('update:modelValue', value)
}
</script>

<template>
  <ToggleGroupRoot
    as-child
    type="single"
    :model-value="modelValue"
    @update:model-value="updateValue"
  >
    <div class="ui-segmented-control" :aria-label="ariaLabel">
      <ToggleGroupItem
        v-for="option in options"
        :key="option.value"
        class="ui-segmented-button"
        :class="{ active: modelValue === option.value }"
        :value="option.value"
        :title="option.tooltip"
        :aria-label="option.tooltip ? `${option.label}: ${option.tooltip}` : option.label"
        :disabled="option.disabled"
      >
        <span v-if="option.icon" :class="option.icon" />
        {{ option.label }}
      </ToggleGroupItem>
    </div>
  </ToggleGroupRoot>
</template>

<style lang="scss">
.ui-segmented-control {
  @apply h-27px rounded-5px p-2px flex items-center;
  @apply dark:bg-$ui-control-background;
  @apply light:[background:color-mix(in_srgb,var(--ui-switch-background)_46%,var(--ui-surface-background))];
}

.ui-segmented-button {
  @apply h-24px border-0 rounded-4px px-8px bg-transparent;
  @apply inline-flex items-center justify-center gap-5px whitespace-nowrap;
  @apply text-12px cursor-pointer outline-none light:color-$gray-5 dark:color-$gray-9;
  @apply transition duration-120 ease-out;

  &:hover:not(.active):not(:disabled) {
    @apply color-$ui-foreground;
    background-color: color-mix(in srgb, var(--ui-hover-background), var(--ui-foreground) 5%);
  }

  &.active {
    @apply bg-$ui-surface-background color-$ui-foreground;
  }

  &:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}
</style>
