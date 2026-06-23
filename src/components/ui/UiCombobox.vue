<script lang="ts" setup>
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'

const props = withDefaults(defineProps<{
  modelValue: string | null
  options: string[]
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
  invalid?: boolean
  minWidth?: string
  contentWidth?: string
}>(), {
  placeholder: '',
  ariaLabel: '',
  disabled: false,
  invalid: false,
  minWidth: '220px',
  contentWidth: '240px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'blur': [event: FocusEvent]
}>()

const inputValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => {
    emit('update:modelValue', value || null)
  },
})

const normalizedOptions = computed(() =>
  Array.from(new Set(props.options.filter(Boolean))).sort((a, b) => a.localeCompare(b)),
)

function updateValue(value: string | string[] | null) {
  emit('update:modelValue', Array.isArray(value) ? value[0] || null : value)
}

function handleInput(event: Event) {
  inputValue.value = (event.target as HTMLInputElement).value
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<template>
  <ComboboxRoot
    v-model="inputValue"
    :disabled="disabled"
    :ignore-filter="false"
    @update:model-value="updateValue"
  >
    <ComboboxAnchor
      class="ui-combobox-anchor"
      :class="{ invalid }"
      :style="{ minWidth }"
    >
      <ComboboxInput
        class="ui-combobox-input"
        :placeholder="placeholder"
        :aria-label="ariaLabel || placeholder"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
      />
      <ComboboxTrigger class="ui-combobox-trigger" :disabled="disabled">
        <span class="i-lucide:chevron-down" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        class="ui-combobox-content"
        position="popper"
        :side-offset="5"
        :style="{ minWidth, width: contentWidth }"
      >
        <ComboboxViewport
          class="ui-combobox-viewport ui-thin-scrollbar"
        >
          <ComboboxItem
            v-for="option in normalizedOptions"
            :key="option"
            class="ui-combobox-item"
            :value="option"
          >
            <ComboboxItemIndicator class="ui-combobox-check">
              <span class="i-lucide:check" />
            </ComboboxItemIndicator>
            <span class="ui-combobox-item-text">{{ option }}</span>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<style lang="scss">
.ui-combobox-anchor {
  @apply h-30px rounded-md border px-9px;
  @apply inline-flex items-center justify-between gap-7px;
  @apply border-solid border-$ui-input bg-$ui-control-background color-$ui-foreground;
  @apply shadow-$shadow-control transition duration-120 ease-out;

  &:hover {
    border-color: color-mix(in srgb, var(--ui-input), var(--ui-foreground) 18%);
  }

  &:focus-within {
    @apply border-$ui-ring shadow-$shadow-focus;
  }

  &.invalid {
    @apply border-$red-5;
  }
}

.ui-combobox-input {
  @apply h-full min-w-0 flex-1 border-0 bg-transparent p-0 outline-none;
  @apply text-11px color-$ui-foreground;

  &::placeholder {
    @apply color-$ui-muted-foreground;
  }

  &:disabled {
    @apply cursor-not-allowed opacity-50;
  }
}

.ui-combobox-trigger {
  @apply h-full w-16px shrink-0 border-0 bg-transparent p-0;
  @apply inline-flex items-center justify-center cursor-pointer text-12px opacity-65;
  @apply color-$ui-muted-foreground;

  &:disabled {
    @apply cursor-not-allowed;
  }
}

.ui-combobox-content {
  @apply z-50 rounded-md border p-1 outline-none;
  @apply border-solid border-$ui-border bg-$ui-popover-background color-$ui-foreground;
  @apply shadow-$shadow-popup backdrop-blur-8px backdrop-saturate-140;

  &[data-state="open"] {
    @apply animate-[combobox-enter_120ms_cubic-bezier(0.16,1,0.3,1)];
  }
}

.ui-combobox-viewport[data-reka-combobox-viewport] {
  @apply overflow-y-auto;
  max-height: min(240px, var(--reka-combobox-content-available-height, 240px));
}

.ui-combobox-item {
  @apply relative h-28px rounded-sm pl-25px pr-7px outline-none;
  @apply flex items-center cursor-pointer select-none text-12px;

  &[data-highlighted] {
    @apply bg-$ui-option-hover-background color-$ui-accent-foreground;
  }

  &[data-disabled] {
    @apply opacity-45 cursor-not-allowed;
  }
}

.ui-combobox-item-text {
  @apply min-w-0 truncate;
}

.ui-combobox-check {
  @apply absolute left-7px top-1/2 -translate-y-1/2 text-12px;
  @apply color-$ui-primary;
}

@keyframes combobox-enter {
  from {
    @apply opacity-0;
    transform: translateY(-3px) scale(0.985);
  }
}
</style>
