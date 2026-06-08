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

export interface LanguageFilterOption {
  value: string
  label: string
  color?: string
  count?: number
}

const props = withDefaults(defineProps<{
  modelValue: string | null
  options: LanguageFilterOption[]
  placeholder?: string
  ariaLabel?: string
  minWidth?: string
  contentWidth?: string
}>(), {
  placeholder: 'Select',
  minWidth: '150px',
  contentWidth: '210px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedOption = computed(() =>
  props.options.find(option => option.value === props.modelValue),
)

const triggerLabel = computed(() =>
  props.ariaLabel || props.placeholder || selectedOption.value?.label || 'Select',
)

function colorDotStyle(color?: string) {
  return {
    backgroundColor: color || 'currentColor',
  }
}
</script>

<template>
  <SelectRoot
    :model-value="modelValue ?? undefined"
    @update:model-value="value => emit('update:modelValue', String(value))"
  >
    <SelectTrigger
      class="ui-select-trigger"
      :style="{ minWidth }"
      :aria-label="triggerLabel"
    >
      <SelectValue :placeholder="placeholder">
        <span class="ui-select-label language-filter-label">
          <span
            v-if="selectedOption?.color"
            class="language-filter-dot"
            :style="colorDotStyle(selectedOption?.color)"
          />
          <span class="language-filter-label-text">
            {{ selectedOption?.label || placeholder }}
          </span>
        </span>
        <span v-if="selectedOption?.count !== undefined" class="language-filter-count-badge">
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
        <SelectViewport
          class="ui-select-viewport ui-thin-scrollbar"
        >
          <SelectItem
            v-for="option in options"
            :key="option.value"
            class="ui-select-item"
            :value="option.value"
          >
            <SelectItemIndicator class="ui-select-check">
              <span class="i-lucide:check" />
            </SelectItemIndicator>
            <SelectItemText class="ui-select-item-text">
              <span class="language-filter-option-main">
                <span
                  class="language-filter-dot"
                  :class="{ placeholder: !option.color }"
                  :style="colorDotStyle(option.color)"
                />
                <span>{{ option.label }}</span>
              </span>
              <span v-if="option.count !== undefined" class="language-filter-count-badge">
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
.language-filter-label {
  @apply min-w-0 inline-flex items-center gap-7px;
}

.language-filter-label-text {
  @apply min-w-0 truncate;
}

.language-filter-dot {
  @apply size-8px shrink-0 rounded-full;

  &.placeholder {
    @apply opacity-0;
  }
}

.language-filter-option-main {
  @apply min-w-0 flex items-center gap-7px;

  span:last-child {
    @apply min-w-0 truncate;
  }
}

.language-filter-count-badge {
  @apply shrink-0 size-18px rounded-full px-0;
  @apply inline-flex items-center justify-center;
  @apply text-11px font-650;
  @apply bg-$ui-hover-background color-$ui-muted-foreground;
}
</style>
