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

import type { UiActionMenuItem } from './actionMenu'

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

const contentStyle = computed(() => ({
  width: `${props.width}px`,
}))

function selectItem(item: UiActionMenuItem) {
  if (!item.disabled && !item.children?.length)
    emit('select', item.id)
}

function submenuContentStyle(item: UiActionMenuItem) {
  return {
    width: `${item.submenuWidth ?? props.width}px`,
  }
}

function hasCheckedItems(items?: UiActionMenuItem[]) {
  return items?.some(item => item.checked) === true
}
</script>

<template>
  <DropdownMenuRoot v-if="mode === 'dropdown'" :modal="false">
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
              >
                <template v-for="child in item.children" :key="child.id">
                  <DropdownMenuSeparator v-if="child.separatorBefore" class="ui-action-menu-separator" />
                  <DropdownMenuItem
                    class="ui-action-menu-item"
                    :class="{ danger: child.danger }"
                    :disabled="child.disabled"
                    @select="selectItem(child)"
                  >
                    <span v-if="hasCheckedItems(item.children)" class="ui-action-menu-state">
                      <span v-if="child.checked" class="ui-action-menu-check i-lucide:check" />
                    </span>
                    <span class="ui-action-menu-icon" :class="child.icon" />
                    <span class="ui-action-menu-label">{{ child.label }}</span>
                    <span class="ui-action-menu-trailing" />
                  </DropdownMenuItem>
                </template>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            v-else
            class="ui-action-menu-item"
            :class="{ danger: item.danger }"
            :disabled="item.disabled"
            @select="selectItem(item)"
          >
            <span v-if="hasCheckedItems(items)" class="ui-action-menu-state">
              <span v-if="item.checked" class="ui-action-menu-check i-lucide:check" />
            </span>
            <span class="ui-action-menu-icon" :class="item.icon" />
            <span class="ui-action-menu-label">{{ item.label }}</span>
            <span class="ui-action-menu-trailing" />
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>

  <ContextMenuRoot v-else :modal="false">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent
        class="ui-action-menu-content ui-thin-scrollbar"
        :class="{ 'has-check-column': hasCheckedItems(items) }"
        :style="contentStyle"
        :aria-label="ariaLabel"
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
              >
                <template v-for="child in item.children" :key="child.id">
                  <ContextMenuSeparator v-if="child.separatorBefore" class="ui-action-menu-separator" />
                  <ContextMenuItem
                    class="ui-action-menu-item"
                    :class="{ danger: child.danger }"
                    :disabled="child.disabled"
                    @select="selectItem(child)"
                  >
                    <span v-if="hasCheckedItems(item.children)" class="ui-action-menu-state">
                      <span v-if="child.checked" class="ui-action-menu-check i-lucide:check" />
                    </span>
                    <span class="ui-action-menu-icon" :class="child.icon" />
                    <span class="ui-action-menu-label">{{ child.label }}</span>
                    <span class="ui-action-menu-trailing" />
                  </ContextMenuItem>
                </template>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
          <ContextMenuItem
            v-else
            class="ui-action-menu-item"
            :class="{ danger: item.danger }"
            :disabled="item.disabled"
            @select="selectItem(item)"
          >
            <span v-if="hasCheckedItems(items)" class="ui-action-menu-state">
              <span v-if="item.checked" class="ui-action-menu-check i-lucide:check" />
            </span>
            <span class="ui-action-menu-icon" :class="item.icon" />
            <span class="ui-action-menu-label">{{ item.label }}</span>
            <span class="ui-action-menu-trailing" />
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
  grid-template-columns: 14px minmax(0, 1fr) 14px;

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
    @apply size-14px shrink-0;
    cursor: inherit;
  }

  &[data-highlighted] {
    @apply color-$ui-accent-foreground;
    background-color: var(--ui-option-hover-background);
  }

  &[data-disabled] {
    @apply cursor-not-allowed opacity-45;
  }

  &.danger {
    color: color-mix(in srgb, var(--red-5) 92%, var(--ui-foreground));

    .ui-action-menu-icon {
      color: color-mix(in srgb, var(--red-5) 92%, var(--ui-foreground));
    }

    &[data-highlighted] {
      color: var(--gray-14);
      background-color: var(--red-5);

      .ui-action-menu-icon {
        color: var(--gray-14);
      }
    }
  }
}

.ui-action-menu-content.has-check-column .ui-action-menu-item {
  grid-template-columns: 14px 14px minmax(0, 1fr) 14px;
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

  &[data-highlighted] {
    color: var(--gray-14);
    background-color: color-mix(in srgb, var(--red-5) 82%, var(--red-6));

    .ui-action-menu-icon {
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
