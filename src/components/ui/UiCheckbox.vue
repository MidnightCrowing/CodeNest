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
  <div class="ui-checkbox-field" :class="{ disabled }">
    <CheckboxRoot
      class="ui-checkbox-root"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="updateChecked"
    >
      <CheckboxIndicator class="ui-checkbox-indicator">
        <span class="i-lucide:check" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span class="ui-checkbox-label" @click="toggleFromField">
      <slot />
    </span>
  </div>
</template>

<style lang="scss">
.ui-checkbox-field {
  @apply min-w-0 inline-flex items-start gap-8px cursor-pointer;

  &.disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}

.ui-checkbox-root {
  @apply mt-1px size-16px shrink-0 rounded-4px border outline-none;
  @apply inline-flex items-center justify-center;
  @apply border-$ui-input bg-$ui-checkbox-background;
  @apply transition duration-120 ease-out;
  @apply data-[disabled]:cursor-not-allowed;
  appearance: none;
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
}

.ui-checkbox-indicator {
  @apply flex items-center justify-center text-12px color-$ui-primary-foreground;
}

.ui-checkbox-label {
  @apply min-w-0 text-12px;
  overflow-wrap: anywhere;
}
</style>
