<script lang="ts" setup>
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
  width?: string
  modal?: boolean
  actionsLayout?: 'reverse' | 'end'
}>(), {
  title: '',
  description: '',
  width: '400px',
  modal: true,
  actionsLayout: 'reverse',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const contentStyle = computed(() => ({
  width: props.width,
}))
</script>

<template>
  <DialogRoot
    :open="open"
    :modal="modal"
    @update:open="value => emit('update:open', value)"
  >
    <DialogPortal>
      <DialogOverlay class="ui-dialog-overlay" />
      <DialogContent class="ui-dialog-content" :style="contentStyle">
        <DialogTitle v-if="title || $slots.title" class="ui-dialog-title">
          <slot name="title">
            {{ title }}
          </slot>
        </DialogTitle>

        <DialogDescription v-if="description || $slots.description" class="ui-dialog-description">
          <slot name="description">
            {{ description }}
          </slot>
        </DialogDescription>

        <slot />

        <div v-if="$slots.actions" class="ui-dialog-actions" :data-layout="actionsLayout">
          <slot name="actions" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style lang="scss" scoped>
.ui-dialog-overlay {
  @apply fixed left-0 right-0 bottom-0 z-40;
  @apply bg-black/30 dark:bg-black/50;
  top: var(--window-titlebar-height, 40px);
}

.ui-dialog-content {
  @apply fixed left-1/2 z-50 max-w-[calc(100vw-32px)];
  @apply -translate-x-1/2 -translate-y-1/2 rounded-6px border p-20px outline-none;
  @apply border-$ui-border bg-$ui-surface-background color-$ui-foreground;
  border-style: solid;
  box-shadow: var(--shadow-dialog);
  top: calc(var(--window-titlebar-height, 40px) + 50%);

  &[data-state="open"] {
    animation: dialog-enter 140ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state="closed"] {
    animation: dialog-exit 100ms ease-in;
  }
}

.ui-dialog-title {
  @apply m-0 text-15px font-650 lh-20px;
  overflow-wrap: anywhere;
}

.ui-dialog-description {
  @apply mt-8px mb-0 text-13px lh-18px light:color-$gray-5 dark:color-$gray-9;
  overflow-wrap: anywhere;
}

.ui-dialog-actions {
  @apply mt-20px flex flex-wrap gap-8px;

  &[data-layout="reverse"] {
    @apply flex-row-reverse;
  }

  &[data-layout="end"] {
    @apply justify-end;
  }
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 6px)) scale(0.985);
  }
}

@keyframes dialog-exit {
  to {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 4px)) scale(0.985);
  }
}
</style>
