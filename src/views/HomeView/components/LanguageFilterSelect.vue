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
        <span class="ui-select-label" min-w-0 inline-flex items-center gap-7px>
          <span
            v-if="selectedOption?.color"
            size-8px shrink-0 rounded-full
            :style="colorDotStyle(selectedOption?.color)"
          />
          <span min-w-0 truncate>
            {{ selectedOption?.label || placeholder }}
          </span>
        </span>
        <span
          v-if="selectedOption?.count !== undefined"
          ml-6px shrink-0 text-11px font-650 color="$ui-muted-foreground"
        >
          {{ selectedOption.count }}
        </span>
      </SelectValue>
      <SelectIcon class="ui-select-icon">
        <span i-lucide:chevron-down />
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
              <span i-lucide:check />
            </SelectItemIndicator>
            <SelectItemText class="ui-select-item-text">
              <span min-w-0 flex items-center gap-7px>
                <span
                  size-8px shrink-0 rounded-full
                  :class="{ 'opacity-0': !option.color }"
                  :style="colorDotStyle(option.color)"
                />
                <span min-w-0 truncate>{{ option.label }}</span>
              </span>
              <span
                v-if="option.count !== undefined"
                shrink-0 text-11px font-650 color="$ui-muted-foreground"
              >
                {{ option.count }}
              </span>
            </SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
