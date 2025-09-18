<script lang="ts" setup>
import { JeTransparentToolButton } from '../Button'
import { TABS_INJECT_KEY } from './key'
import type { JeTabPaneProps, JeTabsProps } from './types'

interface InternalPane extends JeTabPaneProps { order: number }

const props = withDefaults(defineProps<JeTabsProps>(), {
  closable: false,
  addable: false,
  scrollable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
  (e: 'tabAdd'): void
  (e: 'tabClose', v: string | number): void
}>()

const panes = reactive<InternalPane[]>([])
let count = 0

const activeValue = computed(() => props.modelValue)

function registerPane(pane: JeTabPaneProps) {
  const exist = panes.find(p => p.value === pane.value)
  if (exist) {
    exist.label = pane.label
    exist.disabled = pane.disabled
    exist.closable = pane.closable
    exist.icon = pane.icon
    exist.lazy = pane.lazy
  }
  else if (!panes.find(p => p.value === pane.value)) {
    panes.push({ ...pane, order: count++ })
  }
}
function unregisterPane(value: string | number) {
  const idx = panes.findIndex(p => p.value === value)
  if (idx !== -1)
    panes.splice(idx, 1)
}

function updateActive(v: string | number) {
  if (v === props.modelValue)
    return
  emit('update:modelValue', v)
}

function handleClose(e: MouseEvent, pane: InternalPane) {
  e.stopPropagation()
  emit('tabClose', pane.value)
  const idx = panes.findIndex(p => p.value === pane.value)
  if (idx !== -1)
    panes.splice(idx, 1)
  if (pane.value === props.modelValue) {
    if (panes.length) {
      const newIdx = idx < panes.length ? idx : panes.length - 1
      emit('update:modelValue', panes[newIdx].value)
    }
    else {
      emit('update:modelValue', '' as any)
    }
  }
}

function handleAdd() {
  emit('tabAdd')
}

provide(TABS_INJECT_KEY, {
  registerPane,
  unregisterPane,
  activeValue,
  parentClosable: toRef(props, 'closable'),
})

const sortedPanes = computed(() => [...panes].sort((a, b) => a.order - b.order))
</script>

<template>
  <div class="je-tabs">
    <div class="je-tabs__nav-wrapper" :class="{ 'je-tabs__nav-wrapper--scroll': scrollable }">
      <div class="je-tabs__nav" :class="{ 'je-tabs__nav--scroll': scrollable }">
        <div
          v-for="pane in sortedPanes"
          :key="pane.value"
          class="je-tabs__tab"
          :class="[
            { 'je-tabs__tab--active': pane.value === activeValue, 'je-tabs__tab--disabled': pane.disabled },
          ]"
          tabindex="0"
          role="tab"
          @click="!pane.disabled && updateActive(pane.value)"
          @keydown.enter.prevent="!pane.disabled && updateActive(pane.value)"
        >
          <i
            v-if="pane.icon"
            class="je-tabs__tab-icon"
            :class="pane.icon"
          />
          <span class="je-tabs__tab-label truncate">{{ pane.label }}</span>
          <i
            v-if="(pane.closable ?? closable) && !pane.disabled"
            class="je-tabs__tab-close light:i-jet:close-small dark:i-jet:close-small-dark"
            @click="e => handleClose(e, pane)"
          />
        </div>

        <JeTransparentToolButton
          v-if="addable"
          class="je-tabs__add-btn"
          icon="light:i-jet:add dark:i-jet:add-dark"
          icon-size="14px"
          @click="handleAdd"
        />
      </div>
    </div>
    <div class="je-tabs__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-tabs {
  // 基础排版
  @apply flex flex-col w-full;
  @apply font-sans text-13px lh-20px;
}

.je-tabs__nav-wrapper {
  @apply relative flex items-end; // 底部分隔线
  @apply b-b-solid b-b-1px light:b-b-$gray-12 dark:b-b-$gray-3;

  &--scroll {
    @apply overflow-x-auto scrollbar-none;
  }
}

.je-tabs__nav {
  @apply flex items-stretch gap-2px px-2px pt-2px; // 间距

  &--scroll {
    @apply min-w-full;
  }
}

.je-tabs__tab {
  @apply relative flex items-center gap-6px select-none cursor-pointer;
  @apply rounded-t-4px px-10px py-5px outline-0;
  @apply light:color-$gray-6 dark:color-$gray-8; // 非激活颜色
  @apply light:hover:bg-$gray-13 dark:hover:bg-$gray-2;
  @apply transition-colors duration-130 ease-in-out;

  &:focus-visible:not(.je-tabs__tab--active):not(.je-tabs__tab--disabled) {
    @apply outline outline-2px light:outline-$blue-4 dark:outline-$blue-6 rounded-4px;
  }

  &--active {
    @apply light:bg-$gray-13 dark:bg-$gray-2; // 背景
    @apply light:color-$gray-1 dark:color-$gray-12; // 文本
    @apply after:absolute after:bottom-0 after:left-0 after:right-0 after:h-2px after:content-empty;
    @apply light:after:bg-$blue-4 dark:after:bg-$blue-6; // 下划线指示
  }

  &--disabled {
    @apply cursor-not-allowed light:color-$gray-9 dark:color-$gray-5;
    @apply opacity-60;
  }
}

.je-tabs__tab-label {
  @apply text-default;
}

.je-tabs__tab-icon {
  @apply text-14px;
}

.je-tabs__tab-close {
  @apply text-14px opacity-70 hover:opacity-100 transition-opacity duration-120 cursor-pointer;
}

.je-tabs__add-btn {
  @apply ml-4px my-auto;
}

.je-tabs__content {
  @apply pt-8px;
}
</style>
