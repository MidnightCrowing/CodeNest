<script lang="ts" setup>
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
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
  if (!item.disabled)
    emit('select', item.id)
}
</script>

<template>
  <DropdownMenuRoot v-if="mode === 'dropdown'" :modal="false">
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="ui-action-menu-content"
        :style="contentStyle"
        :align="align"
        :side-offset="5"
        :aria-label="ariaLabel"
      >
        <template v-for="item in items" :key="item.id">
          <DropdownMenuSeparator v-if="item.separatorBefore" class="ui-action-menu-separator" />
          <DropdownMenuItem
            class="ui-action-menu-item"
            :class="{ danger: item.danger }"
            :disabled="item.disabled"
            @select="selectItem(item)"
          >
            <span class="ui-action-menu-icon" :class="item.icon" />
            <span class="ui-action-menu-label">{{ item.label }}</span>
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
        class="ui-action-menu-content"
        :style="contentStyle"
        :aria-label="ariaLabel"
      >
        <template v-for="item in items" :key="item.id">
          <ContextMenuSeparator v-if="item.separatorBefore" class="ui-action-menu-separator" />
          <ContextMenuItem
            class="ui-action-menu-item"
            :class="{ danger: item.danger }"
            :disabled="item.disabled"
            @select="selectItem(item)"
          >
            <span class="ui-action-menu-icon" :class="item.icon" />
            <span class="ui-action-menu-label">{{ item.label }}</span>
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
  border-style: solid;
  box-shadow: var(--shadow-popup);

  &[data-state="open"] {
    animation: menu-enter 120ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.ui-action-menu-item {
  @apply h-29px rounded-sm px-8px outline-none;
  @apply grid items-center gap-8px cursor-pointer select-none text-12px;
  @apply color-$ui-foreground;
  grid-template-columns: 14px minmax(0, 1fr);

  .ui-action-menu-icon {
    @apply size-14px shrink-0 color-$ui-muted-foreground;
  }

  .ui-action-menu-label {
    @apply min-w-0 truncate;
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
  @apply my-1 h-1px bg-$ui-border;
}

@keyframes menu-enter {
  from {
    opacity: 0;
    transform: translateY(-3px) scale(0.985);
  }
}
</style>
