<script lang="ts" setup>
import {
  CheckboxIndicator,
  CheckboxRoot,
} from 'reka-ui'

const props = withDefaults(defineProps<{
  modelValue: boolean
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function updateChecked(value: boolean | 'indeterminate') {
  emit('update:modelValue', value === true)
}

function toggleFromField() {
  if (props.disabled)
    return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div
    class="ui-checkbox-field"
    min-w-0 inline-flex items-start gap-8px cursor-pointer
    :class="{ disabled }"
  >
    <CheckboxRoot
      class="ui-checkbox-root"
      mt-1px size-16px shrink-0 rounded-4px border
      outline-none
      inline-flex items-center justify-center
      bg="$ui-checkbox-background"
      transition duration-120 ease-out
      data-disabled:cursor-not-allowed
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="updateChecked"
    >
      <CheckboxIndicator
        class="ui-checkbox-indicator" flex items-center justify-center text-12px
        color="$ui-primary-foreground"
      >
        <span class="i-lucide:check" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span class="ui-checkbox-label" min-w-0 text-12px break-anywhere @click="toggleFromField">
      <slot />
    </span>
  </div>
</template>

<style lang="scss">
.ui-checkbox-field {
  &.disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}

.ui-checkbox-root {
  @apply appearance-none border-solid border-$ui-input shadow-$shadow-control;

  &:hover {
    border-color: color-mix(in srgb, var(--ui-input), var(--ui-foreground) 20%);
  }

  &:focus-visible {
    @apply shadow-$shadow-focus;
  }

  &[data-state="checked"] {
    @apply border-$ui-primary bg-$ui-primary;
  }
}
</style>
