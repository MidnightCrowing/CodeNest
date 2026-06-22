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
      <DialogOverlay
        class="ui-dialog-overlay"
        fixed left-0 right-0 bottom-0 z-40
        bg="black/30" dark:bg="black/50"
      />
      <DialogContent
        class="ui-dialog-content left-1/2 -translate-x-1/2 -translate-y-1/2"
        fixed z-50 max-w="[calc(100vw-32px)]"
        rounded-6px border p-20px outline-none
        bg="$ui-surface-background" color="$ui-foreground"
        :style="contentStyle"
      >
        <DialogTitle
          v-if="title || $slots.title"
          m-0 text-15px font-650 lh-20px
          class="ui-dialog-title"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </DialogTitle>

        <DialogDescription
          v-if="description || $slots.description"
          mt-8px mb-0 text-13px lh-18px
          light:color="$gray-5" dark:color="$gray-9"
          class="ui-dialog-description"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </DialogDescription>

        <slot />

        <div
          v-if="$slots.actions"
          class="ui-dialog-actions"
          mt-20px flex flex-wrap gap-8px
          :data-layout="actionsLayout"
        >
          <slot name="actions" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style lang="scss" scoped>
.ui-dialog-overlay {
  top: var(--window-titlebar-height, 40px);
}

.ui-dialog-content {
  border-color: var(--ui-border);
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
  overflow-wrap: anywhere;
}

.ui-dialog-description {
  overflow-wrap: anywhere;
}

.ui-dialog-actions {
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
