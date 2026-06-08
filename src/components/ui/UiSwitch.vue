<script lang="ts" setup>
import {
  SwitchRoot,
  SwitchThumb,
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

const DRAG_THRESHOLD = 3
const DEFAULT_THUMB_TRAVEL = 16

const dragState = reactive({
  active: false,
  dragged: false,
  startX: 0,
  startOffset: 0,
  offset: 0,
  maxOffset: DEFAULT_THUMB_TRAVEL,
})
const blockNextClick = ref(false)

const thumbOffset = computed(() =>
  dragState.active ? dragState.offset : props.modelValue ? dragState.maxOffset : 0,
)

const previewChecked = computed(() =>
  dragState.active ? dragState.offset >= dragState.maxOffset / 2 : props.modelValue,
)

const switchClasses = computed(() => ({
  dragging: dragState.active,
  'drag-preview-checked': dragState.active && previewChecked.value,
  'drag-preview-unchecked': dragState.active && !previewChecked.value,
}))

const thumbStyle = computed(() => ({
  transform: `translateX(${thumbOffset.value}px)`,
}))

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function blockSyntheticClick() {
  blockNextClick.value = true

  window.setTimeout(() => {
    blockNextClick.value = false
  }, 120)
}

function getThumbTravel(thumb: HTMLElement) {
  const root = thumb.closest<HTMLElement>('.ui-switch')
  if (!root)
    return DEFAULT_THUMB_TRAVEL

  const rootStyle = window.getComputedStyle(root)
  const paddingLeft = Number.parseFloat(rootStyle.paddingLeft) || 0
  const paddingRight = Number.parseFloat(rootStyle.paddingRight) || 0
  const travel = root.clientWidth - paddingLeft - paddingRight - thumb.offsetWidth

  return Math.max(0, travel || DEFAULT_THUMB_TRAVEL)
}

function beginDrag(event: PointerEvent) {
  if (props.disabled || (event.button !== undefined && event.button !== 0))
    return

  const thumb = event.currentTarget as HTMLElement
  dragState.maxOffset = getThumbTravel(thumb)
  dragState.active = true
  dragState.dragged = false
  dragState.startX = event.clientX
  dragState.startOffset = props.modelValue ? dragState.maxOffset : 0
  dragState.offset = dragState.startOffset

  thumb.setPointerCapture?.(event.pointerId)
  thumb.closest<HTMLElement>('.ui-switch')?.focus()
}

function updateDrag(event: PointerEvent) {
  if (!dragState.active)
    return

  const delta = event.clientX - dragState.startX
  dragState.offset = clamp(dragState.startOffset + delta, 0, dragState.maxOffset)

  if (Math.abs(delta) > DRAG_THRESHOLD) {
    dragState.dragged = true
    event.preventDefault()
  }
}

function finishDrag(event: PointerEvent) {
  if (!dragState.active)
    return

  const wasDragged = dragState.dragged
  const nextValue = previewChecked.value
  dragState.active = false
  dragState.dragged = false

  const thumb = event.currentTarget as HTMLElement
  thumb.releasePointerCapture?.(event.pointerId)

  if (!wasDragged)
    return

  blockSyntheticClick()

  if (nextValue !== props.modelValue)
    emit('update:modelValue', nextValue)
}

function cancelDrag(event: PointerEvent) {
  if (!dragState.active)
    return

  const wasDragged = dragState.dragged
  dragState.active = false
  dragState.dragged = false

  const thumb = event.currentTarget as HTMLElement
  thumb.releasePointerCapture?.(event.pointerId)

  if (wasDragged)
    blockSyntheticClick()
}

function handleClickCapture(event: MouseEvent) {
  if (!blockNextClick.value)
    return

  blockNextClick.value = false
  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <SwitchRoot
    class="ui-switch"
    :class="switchClasses"
    :model-value="modelValue"
    :disabled="disabled"
    @click.capture="handleClickCapture"
    @update:model-value="value => emit('update:modelValue', Boolean(value))"
  >
    <SwitchThumb
      class="ui-switch-thumb"
      :style="thumbStyle"
      @pointerdown="beginDrag"
      @pointermove="updateDrag"
      @pointerup="finishDrag"
      @pointercancel="cancelDrag"
      @lostpointercapture="cancelDrag"
    />
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
  touch-action: pan-y;
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

.ui-switch.dragging .ui-switch-thumb {
  cursor: grabbing;
  transition:
    background-color 120ms ease,
    border-color 120ms ease;
}

.ui-switch[data-state="checked"] .ui-switch-thumb {
  @apply bg-$ui-primary-foreground;
  border-color: transparent;
  transform: translateX(16px);
}

.ui-switch.drag-preview-checked {
  @apply border-$ui-primary bg-$ui-primary;
}

.ui-switch.drag-preview-checked .ui-switch-thumb {
  @apply bg-$ui-primary-foreground;
  border-color: transparent;
}

.ui-switch.drag-preview-unchecked {
  @apply border-$ui-input;
  background-color: var(--ui-switch-background);
}

.ui-switch.drag-preview-unchecked .ui-switch-thumb {
  @apply bg-white;
  border-color: color-mix(in srgb, var(--ui-border), transparent 35%);
}

.ui-switch:disabled .ui-switch-thumb {
  cursor: not-allowed;
}
</style>
