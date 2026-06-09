<script lang="ts" setup>
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'reka-ui'

import type { UiActionMenuItem, UiActionMenuShortcut } from './actionMenu'

const props = withDefaults(defineProps<{
  mode?: 'dropdown' | 'context'
  items: UiActionMenuItem[]
  width?: number
  ariaLabel?: string
  align?: 'start' | 'center' | 'end'
}>(), {
  mode: 'dropdown',
  width: 198,
  ariaLabel: 'Action menu',
  align: 'end',
})

const emit = defineEmits<{
  select: [id: string]
}>()

const dropdownOpen = ref(false)
const contextOpen = ref(false)

const isApplePlatform = typeof navigator !== 'undefined'
  && (/Mac|iPhone|iPad|iPod/.test(navigator.platform) || navigator.userAgent.includes('Mac OS'))

const appleShortcutLabels: Record<string, string> = {
  alt: '⌥',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  arrowup: '↑',
  backspace: '⌫',
  cmd: '⌘',
  command: '⌘',
  control: '⌃',
  ctrl: '⌃',
  delete: '⌫',
  down: '↓',
  enter: '↩',
  esc: 'Esc',
  escape: 'Esc',
  left: '←',
  meta: '⌘',
  mod: '⌘',
  option: '⌥',
  return: '↩',
  right: '→',
  shift: '⇧',
  space: 'Space',
  tab: '⇥',
  up: '↑',
}

const standardShortcutLabels: Record<string, string> = {
  alt: 'Alt',
  arrowdown: 'Down',
  arrowleft: 'Left',
  arrowright: 'Right',
  arrowup: 'Up',
  backspace: 'Backspace',
  cmd: 'Ctrl',
  command: 'Ctrl',
  control: 'Ctrl',
  ctrl: 'Ctrl',
  delete: 'Delete',
  down: 'Down',
  enter: 'Enter',
  esc: 'Esc',
  escape: 'Esc',
  left: 'Left',
  meta: 'Win',
  mod: 'Ctrl',
  option: 'Alt',
  return: 'Enter',
  right: 'Right',
  shift: 'Shift',
  space: 'Space',
  tab: 'Tab',
  up: 'Up',
}

const contentStyle = computed(() => ({
  width: `${props.width}px`,
}))

const menuNavigationKeys = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Escape',
  'Home',
  'Tab',
  ' ',
])

function selectItem(item: UiActionMenuItem) {
  if (!item.disabled && !item.children?.length) {
    closeMenu()
    emit('select', item.id)
  }
}

function submenuContentStyle(item: UiActionMenuItem) {
  return {
    width: `${item.submenuWidth ?? props.width}px`,
  }
}

function hasCheckedItems(items?: UiActionMenuItem[]) {
  return items?.some(item => item.checked) === true
}

function normalizeShortcutKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, '')
}

function formatShortcutKey(key: string) {
  const rawKey = key.trim()
  const normalizedKey = normalizeShortcutKey(rawKey)
  const labels = isApplePlatform ? appleShortcutLabels : standardShortcutLabels
  const label = labels[normalizedKey]
  if (label)
    return label
  if (/^f\d{1,2}$/.test(normalizedKey))
    return normalizedKey.toUpperCase()
  return rawKey.length === 1 ? rawKey.toUpperCase() : rawKey
}

function formatShortcut(item: UiActionMenuItem) {
  if (!item.shortcut || item.trailingIcon)
    return ''

  const keys = Array.isArray(item.shortcut)
    ? item.shortcut
    : item.shortcut.split('+')

  const formattedKeys = keys
    .map(formatShortcutKey)
    .filter(Boolean)

  return formattedKeys.join(isApplePlatform ? '' : '+')
}

function shortcutKeys(shortcut: UiActionMenuShortcut) {
  return Array.isArray(shortcut)
    ? shortcut
    : shortcut.split('+')
}

function eventKeyMatches(expectedKey: string, event: KeyboardEvent) {
  const normalizedExpectedKey = normalizeShortcutKey(expectedKey)
  const normalizedEventKey = normalizeShortcutKey(event.key)

  if (normalizedExpectedKey === normalizedEventKey)
    return true

  if (normalizedExpectedKey === 'delete')
    return normalizedEventKey === 'backspace'

  if (normalizedExpectedKey === 'return')
    return normalizedEventKey === 'enter'

  if (normalizedExpectedKey === 'esc')
    return normalizedEventKey === 'escape'

  return false
}

function shortcutMatches(shortcut: UiActionMenuShortcut, event: KeyboardEvent) {
  let expectsAlt = false
  let expectsCtrl = false
  let expectsMeta = false
  let expectsShift = false
  let expectedKey = ''

  for (const rawKey of shortcutKeys(shortcut)) {
    const key = normalizeShortcutKey(rawKey)

    switch (key) {
      case 'alt':
      case 'option':
        expectsAlt = true
        break
      case 'control':
      case 'ctrl':
        expectsCtrl = true
        break
      case 'cmd':
      case 'command':
      case 'mod':
        if (isApplePlatform)
          expectsMeta = true
        else
          expectsCtrl = true
        break
      case 'meta':
        expectsMeta = true
        break
      case 'shift':
        expectsShift = true
        break
      default:
        expectedKey = rawKey
        break
    }
  }

  if (!expectedKey)
    return false

  return event.altKey === expectsAlt
    && event.ctrlKey === expectsCtrl
    && event.metaKey === expectsMeta
    && event.shiftKey === expectsShift
    && eventKeyMatches(expectedKey, event)
}

function findShortcutItem(items: UiActionMenuItem[], event: KeyboardEvent): UiActionMenuItem | null {
  for (const item of items) {
    if (!item.disabled && !item.children?.length && item.shortcut && shortcutMatches(item.shortcut, event))
      return item

    if (item.children?.length) {
      const child = findShortcutItem(item.children, event)
      if (child)
        return child
    }
  }

  return null
}

function closeMenu() {
  dropdownOpen.value = false
  contextOpen.value = false
}

function escapeAttributeValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function renderedMenuItemElement(item: UiActionMenuItem, event: KeyboardEvent) {
  const currentTarget = event.currentTarget
  const ownerDocument = currentTarget instanceof HTMLElement
    ? currentTarget.ownerDocument
    : document

  return ownerDocument.querySelector<HTMLElement>(`[data-ui-action-menu-id="${escapeAttributeValue(item.id)}"]`)
}

function hasHighlightedMenuItem(event: KeyboardEvent) {
  const currentTarget = event.currentTarget
  if (!(currentTarget instanceof HTMLElement))
    return false

  return currentTarget.querySelector('.ui-action-menu-item[data-highlighted]') !== null
}

function closeMenuFromKeyboard(event: KeyboardEvent) {
  closeMenu()
  const currentTarget = event.currentTarget
  if (currentTarget instanceof HTMLElement) {
    currentTarget.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: 'Escape',
      key: 'Escape',
    }))
  }
}

function selectShortcutItem(item: UiActionMenuItem, event: KeyboardEvent) {
  const renderedItem = renderedMenuItemElement(item, event)
  if (renderedItem) {
    renderedItem.click()
    return
  }

  closeMenuFromKeyboard(event)
  void nextTick(() => {
    closeMenu()
    window.requestAnimationFrame(closeMenu)
    emit('select', item.id)
  })
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || menuNavigationKeys.has(event.key))
    return
  if (event.key === 'Enter' && hasHighlightedMenuItem(event))
    return

  const item = findShortcutItem(props.items, event)
  if (!item)
    return

  event.preventDefault()
  event.stopPropagation()
  selectShortcutItem(item, event)
}
</script>

<template>
  <DropdownMenuRoot v-if="mode === 'dropdown'" v-model:open="dropdownOpen" :modal="false">
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="ui-action-menu-content ui-thin-scrollbar"
        :class="{ 'has-check-column': hasCheckedItems(items) }"
        :style="contentStyle"
        :align="align"
        :side-offset="5"
        :aria-label="ariaLabel"
        @keydown.capture="handleMenuKeydown"
      >
        <template v-for="item in items" :key="item.id">
          <DropdownMenuSeparator v-if="item.separatorBefore" class="ui-action-menu-separator" />
          <DropdownMenuSub v-if="item.children?.length">
            <DropdownMenuSubTrigger
              class="ui-action-menu-item ui-action-menu-sub-trigger"
              :disabled="item.disabled"
            >
              <span v-if="hasCheckedItems(items)" class="ui-action-menu-state" />
              <span class="ui-action-menu-icon" :class="item.icon" />
              <span class="ui-action-menu-label">{{ item.label }}</span>
              <span class="ui-action-menu-chevron i-lucide:chevron-right" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                class="ui-action-menu-content ui-action-submenu-content ui-thin-scrollbar"
                :class="{ 'has-check-column': hasCheckedItems(item.children) }"
                :style="submenuContentStyle(item)"
                :side-offset="4"
                :align-offset="-4"
                @keydown.capture="handleMenuKeydown"
              >
                <template v-for="child in item.children" :key="child.id">
                  <DropdownMenuSeparator v-if="child.separatorBefore" class="ui-action-menu-separator" />
                  <DropdownMenuItem
                    class="ui-action-menu-item"
                    :class="{ danger: child.danger }"
                    :data-ui-action-menu-id="child.id"
                    :disabled="child.disabled"
                    @select="selectItem(child)"
                  >
                    <span v-if="hasCheckedItems(item.children)" class="ui-action-menu-state">
                      <span v-if="child.checked" class="ui-action-menu-check i-lucide:check" />
                    </span>
                    <span class="ui-action-menu-icon" :class="child.icon" />
                    <span class="ui-action-menu-label">{{ child.label }}</span>
                    <span v-if="child.trailingIcon" class="ui-action-menu-trailing" :class="child.trailingIcon" />
                    <span v-else-if="formatShortcut(child)" class="ui-action-menu-shortcut">{{ formatShortcut(child) }}</span>
                    <span v-else class="ui-action-menu-trailing" />
                  </DropdownMenuItem>
                </template>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            v-else
            class="ui-action-menu-item"
            :class="{ danger: item.danger }"
            :data-ui-action-menu-id="item.id"
            :disabled="item.disabled"
            @select="selectItem(item)"
          >
            <span v-if="hasCheckedItems(items)" class="ui-action-menu-state">
              <span v-if="item.checked" class="ui-action-menu-check i-lucide:check" />
            </span>
            <span class="ui-action-menu-icon" :class="item.icon" />
            <span class="ui-action-menu-label">{{ item.label }}</span>
            <span v-if="item.trailingIcon" class="ui-action-menu-trailing" :class="item.trailingIcon" />
            <span v-else-if="formatShortcut(item)" class="ui-action-menu-shortcut">{{ formatShortcut(item) }}</span>
            <span v-else class="ui-action-menu-trailing" />
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>

  <ContextMenuRoot v-else v-model:open="contextOpen" :modal="false">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent
        class="ui-action-menu-content ui-thin-scrollbar"
        :class="{ 'has-check-column': hasCheckedItems(items) }"
        :style="contentStyle"
        :aria-label="ariaLabel"
        @keydown.capture="handleMenuKeydown"
      >
        <template v-for="item in items" :key="item.id">
          <ContextMenuSeparator v-if="item.separatorBefore" class="ui-action-menu-separator" />
          <ContextMenuSub v-if="item.children?.length">
            <ContextMenuSubTrigger
              class="ui-action-menu-item ui-action-menu-sub-trigger"
              :disabled="item.disabled"
            >
              <span v-if="hasCheckedItems(items)" class="ui-action-menu-state" />
              <span class="ui-action-menu-icon" :class="item.icon" />
              <span class="ui-action-menu-label">{{ item.label }}</span>
              <span class="ui-action-menu-chevron i-lucide:chevron-right" />
            </ContextMenuSubTrigger>
            <ContextMenuPortal>
              <ContextMenuSubContent
                class="ui-action-menu-content ui-action-submenu-content ui-thin-scrollbar"
                :class="{ 'has-check-column': hasCheckedItems(item.children) }"
                :style="submenuContentStyle(item)"
                :side-offset="4"
                :align-offset="-4"
                @keydown.capture="handleMenuKeydown"
              >
                <template v-for="child in item.children" :key="child.id">
                  <ContextMenuSeparator v-if="child.separatorBefore" class="ui-action-menu-separator" />
                  <ContextMenuItem
                    class="ui-action-menu-item"
                    :class="{ danger: child.danger }"
                    :data-ui-action-menu-id="child.id"
                    :disabled="child.disabled"
                    @select="selectItem(child)"
                  >
                    <span v-if="hasCheckedItems(item.children)" class="ui-action-menu-state">
                      <span v-if="child.checked" class="ui-action-menu-check i-lucide:check" />
                    </span>
                    <span class="ui-action-menu-icon" :class="child.icon" />
                    <span class="ui-action-menu-label">{{ child.label }}</span>
                    <span v-if="child.trailingIcon" class="ui-action-menu-trailing" :class="child.trailingIcon" />
                    <span v-else-if="formatShortcut(child)" class="ui-action-menu-shortcut">{{ formatShortcut(child) }}</span>
                    <span v-else class="ui-action-menu-trailing" />
                  </ContextMenuItem>
                </template>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
          <ContextMenuItem
            v-else
            class="ui-action-menu-item"
            :class="{ danger: item.danger }"
            :data-ui-action-menu-id="item.id"
            :disabled="item.disabled"
            @select="selectItem(item)"
          >
            <span v-if="hasCheckedItems(items)" class="ui-action-menu-state">
              <span v-if="item.checked" class="ui-action-menu-check i-lucide:check" />
            </span>
            <span class="ui-action-menu-icon" :class="item.icon" />
            <span class="ui-action-menu-label">{{ item.label }}</span>
            <span v-if="item.trailingIcon" class="ui-action-menu-trailing" :class="item.trailingIcon" />
            <span v-else-if="formatShortcut(item)" class="ui-action-menu-shortcut">{{ formatShortcut(item) }}</span>
            <span v-else class="ui-action-menu-trailing" />
          </ContextMenuItem>
        </template>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>

<style lang="scss">
.ui-action-menu-content {
  @apply z-80 rounded-md border p-1 outline-none;
  @apply border-$ui-border bg-$ui-popover-background color-$ui-foreground;
  @apply backdrop-blur-8px backdrop-saturate-140;
  max-height: clamp(180px, 72vh, 420px);
  overflow-x: hidden;
  overflow-y: auto;
  border-style: solid;
  box-shadow: var(--shadow-popup);

  &[data-state="open"] {
    animation: menu-enter 120ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.ui-action-submenu-content {
  &[data-state="open"] {
    animation: submenu-enter-from-right 100ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state="open"][data-side="left"] {
    animation-name: submenu-enter-from-left;
  }
}

.ui-action-menu-item {
  @apply h-29px rounded-sm px-8px outline-none;
  @apply grid items-center gap-8px cursor-pointer select-none text-12px;
  @apply color-$ui-foreground;
  grid-template-columns: 14px minmax(0, 1fr) max-content;

  .ui-action-menu-state,
  .ui-action-menu-icon {
    @apply size-14px shrink-0 inline-flex items-center justify-center;
    cursor: inherit;
  }

  .ui-action-menu-icon {
    @apply color-$ui-muted-foreground;
  }

  .ui-action-menu-label {
    @apply min-w-0 truncate;
    cursor: inherit;
  }

  .ui-action-menu-check {
    @apply text-12px color-$ui-primary;
  }

  .ui-action-menu-trailing {
    @apply size-14px shrink-0 justify-self-end inline-flex items-center justify-center color-$ui-muted-foreground;
    cursor: inherit;
  }

  .ui-action-menu-shortcut {
    @apply shrink-0 justify-self-end whitespace-nowrap text-11px lh-14px color-$ui-muted-foreground;
    font-family: var(--font-title);
    letter-spacing: 0;
    cursor: inherit;
  }

  &[data-highlighted] {
    @apply color-$ui-accent-foreground;
    background-color: var(--ui-option-hover-background);

    .ui-action-menu-trailing,
    .ui-action-menu-shortcut {
      @apply color-$ui-accent-foreground;
    }
  }

  &[data-disabled] {
    @apply cursor-not-allowed opacity-45;
  }

  &.danger {
    color: color-mix(in srgb, var(--red-5) 92%, var(--ui-foreground));

    .ui-action-menu-icon {
      color: color-mix(in srgb, var(--red-5) 92%, var(--ui-foreground));
    }

    .ui-action-menu-shortcut {
      color: color-mix(in srgb, var(--red-5) 80%, var(--ui-muted-foreground));
    }

    &[data-highlighted] {
      color: var(--gray-14);
      background-color: var(--red-5);

      .ui-action-menu-icon,
      .ui-action-menu-shortcut {
        color: var(--gray-14);
      }
    }
  }
}

.ui-action-menu-content.has-check-column .ui-action-menu-item {
  grid-template-columns: 14px 14px minmax(0, 1fr) max-content;
}

.ui-action-menu-item:not([data-disabled]),
.ui-action-menu-item:not([data-disabled]) * {
  cursor: pointer;
}

.ui-action-menu-item[data-disabled],
.ui-action-menu-item[data-disabled] * {
  cursor: not-allowed;
}

.ui-action-menu-sub-trigger {
  .ui-action-menu-chevron {
    @apply size-12px shrink-0 color-$ui-muted-foreground;
  }

  &[data-highlighted] .ui-action-menu-chevron {
    @apply color-$ui-accent-foreground;
  }
}

.dark .ui-action-menu-item.danger {
  color: color-mix(in srgb, var(--red-6) 82%, var(--gray-14));

  .ui-action-menu-icon {
    color: color-mix(in srgb, var(--red-6) 82%, var(--gray-14));
  }

  .ui-action-menu-shortcut {
    color: color-mix(in srgb, var(--red-6) 72%, var(--gray-14));
  }

  &[data-highlighted] {
    color: var(--gray-14);
    background-color: color-mix(in srgb, var(--red-5) 82%, var(--red-6));

    .ui-action-menu-icon,
    .ui-action-menu-shortcut {
      color: var(--gray-14);
    }
  }
}

.ui-action-menu-separator {
  @apply h-1px;
  margin: 4px 8px;
  background: color-mix(in srgb, var(--ui-border), var(--ui-foreground) 3%);
}

@keyframes menu-enter {
  from {
    opacity: 0;
    transform: translateY(-2px) scale(0.99);
  }
}

@keyframes submenu-enter-from-right {
  from {
    opacity: 0;
    transform: translateX(-2px) scale(0.99);
  }
}

@keyframes submenu-enter-from-left {
  from {
    opacity: 0;
    transform: translateX(2px) scale(0.99);
  }
}
</style>
