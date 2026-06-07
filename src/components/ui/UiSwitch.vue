<script lang="ts" setup>
import {
  SwitchRoot,
  SwitchThumb,
} from 'reka-ui'

withDefaults(defineProps<{
  modelValue: boolean
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <SwitchRoot
    class="ui-switch"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="value => emit('update:modelValue', Boolean(value))"
  >
    <SwitchThumb class="ui-switch-thumb" />
  </SwitchRoot>
</template>

<style lang="scss">
.ui-switch {
  @apply h-20px w-36px shrink-0 rounded-full border p-2px outline-none;
  @apply inline-flex items-center cursor-pointer;
  @apply border-$ui-input;
  @apply transition duration-120 ease-out;
  appearance: none;
  background-color: var(--ui-switch-background);
  border-style: solid;
  box-shadow: var(--shadow-control);

  &:hover {
    border-color: color-mix(in srgb, var(--ui-input), var(--ui-foreground) 20%);
  }

  &:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  &[data-state="checked"] {
    @apply border-$ui-primary bg-$ui-primary;
  }

  &:disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}

.ui-switch-thumb {
  @apply size-14px rounded-full bg-white;
  border: 1px solid color-mix(in srgb, var(--ui-border), transparent 35%);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 22%),
    0 1px 1px rgb(0 0 0 / 14%);
  transform: translateX(0);
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    transform 120ms ease;
}

.ui-switch[data-state="checked"] .ui-switch-thumb {
  @apply bg-$ui-primary-foreground;
  border-color: transparent;
  transform: translateX(16px);
}
</style>
