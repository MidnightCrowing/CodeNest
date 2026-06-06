<script lang="ts" setup>
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'

export interface UiSelectOption<T extends string = string> {
  value: T
  label: string
  count?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string | null
  options: UiSelectOption[]
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
  minWidth?: string
  contentWidth?: string
}>(), {
  placeholder: 'Select',
  disabled: false,
  minWidth: '128px',
  contentWidth: '190px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const selectedOption = computed(() =>
  props.options.find(option => option.value === props.modelValue),
)

const triggerLabel = computed(() =>
  props.ariaLabel || props.placeholder || selectedOption.value?.label || 'Select',
)

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<template>
  <SelectRoot
    :model-value="modelValue ?? undefined"
    :disabled="disabled"
    @update:model-value="value => emit('update:modelValue', String(value))"
  >
    <SelectTrigger
      class="ui-select-trigger"
      :style="{ minWidth }"
      :aria-label="triggerLabel"
      @blur="handleBlur"
    >
      <SelectValue :placeholder="placeholder">
        <span class="ui-select-label">{{ selectedOption?.label || placeholder }}</span>
        <span v-if="selectedOption?.count !== undefined" class="ui-select-count-badge">
          {{ selectedOption.count }}
        </span>
      </SelectValue>
      <SelectIcon class="ui-select-icon">
        <span class="i-lucide:chevron-down" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="ui-select-content"
        position="popper"
        :side-offset="5"
        :style="{ minWidth, width: contentWidth }"
      >
        <SelectViewport class="ui-select-viewport">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            class="ui-select-item"
            :value="option.value"
            :disabled="option.disabled"
          >
            <SelectItemIndicator class="ui-select-check">
              <span class="i-lucide:check" />
            </SelectItemIndicator>
            <SelectItemText class="ui-select-item-text">
              <span>{{ option.label }}</span>
              <span v-if="option.count !== undefined" class="ui-select-count-badge">
                {{ option.count }}
              </span>
            </SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style lang="scss">
.ui-select-trigger {
  @apply h-30px rounded-md border px-9px;
  @apply inline-flex items-center justify-between gap-7px;
  @apply text-12px cursor-pointer outline-none;
  @apply border-$ui-input bg-$ui-control-background color-$ui-foreground;
  @apply shadow-[0_1px_2px_rgb(0_0_0_/_3%)] transition duration-120 ease-out;
  appearance: none;
  border-style: solid;

  &:hover {
    border-color: color-mix(in srgb, var(--ui-input), var(--ui-foreground) 18%);
  }

  &[data-state="open"],
  &:focus-visible {
    border-color: var(--ui-ring);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-ring), transparent 78%);
  }

  &[data-disabled] {
    @apply opacity-50 cursor-not-allowed;
  }
}

.ui-select-label {
  @apply min-w-0 truncate;
}

.ui-select-icon {
  @apply shrink-0 flex items-center text-12px opacity-65;
  color: var(--ui-muted-foreground);
}

.ui-select-content {
  @apply z-50 rounded-md border p-1 outline-none;
  @apply border-$ui-border bg-$ui-popover-background color-$ui-foreground;
  @apply backdrop-blur-8px backdrop-saturate-140;
  border-style: solid;
  box-shadow:
    0 10px 28px rgb(0 0 0 / 14%),
    0 2px 8px rgb(0 0 0 / 8%);
}

.ui-select-viewport {
  @apply overflow-y-auto;
  max-height: min(260px, var(--reka-select-content-available-height, 260px));
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(128, 128, 128, 0.45) transparent;
}

.ui-select-viewport::-webkit-scrollbar {
  @apply w-6px;
}

.ui-select-viewport::-webkit-scrollbar-thumb {
  @apply rounded-full bg-$gray-8/55;
}

.ui-select-viewport::-webkit-scrollbar-track {
  @apply bg-transparent;
}

.ui-select-item {
  @apply relative h-28px rounded-sm pl-25px pr-7px outline-none;
  @apply flex items-center cursor-pointer select-none text-12px;

  &[data-highlighted] {
    @apply bg-$ui-hover-background color-$ui-accent-foreground;
  }

  &[data-disabled] {
    @apply opacity-45 cursor-not-allowed;
  }
}

.ui-select-item-text {
  @apply min-w-0 w-full flex items-center justify-between gap-12px;

  span:first-child {
    @apply min-w-0 truncate;
  }
}

.ui-select-check {
  @apply absolute left-7px top-1/2 -translate-y-1/2 text-12px;
  @apply color-$ui-primary;
}

.ui-select-count-badge {
  @apply shrink-0 size-18px rounded-full px-0;
  @apply inline-flex items-center justify-center;
  @apply text-11px font-650;
  @apply bg-$ui-hover-background color-$ui-muted-foreground;
}
</style>
