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
        rounded-6px border select-none p-20px outline-none
        bg="$ui-surface-background" color="$ui-foreground"
        :style="contentStyle"
      >
        <DialogTitle
          v-if="title || $slots.title"
          m-0 text-15px font-600 lh-20px break-anywhere
        >
          <slot name="title">
            {{ title }}
          </slot>
        </DialogTitle>

        <DialogDescription
          v-if="description || $slots.description"
          mt-8px mb-0 text-13px lh-18px break-anywhere
          light:color="$gray-5" dark:color="$gray-9"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </DialogDescription>

        <slot />

        <div
          v-if="$slots.actions || $slots['actions-start']"
          class="ui-dialog-actions"
          mt-20px flex flex-wrap items-center gap-8px
        >
          <div
            v-if="$slots['actions-start']"
            class="ui-dialog-actions-start"
            min-w-0 flex items-center
          >
            <slot name="actions-start" />
          </div>

          <div
            v-if="$slots.actions"
            class="ui-dialog-actions-end"
            ml-auto flex flex-wrap gap-8px
            :data-layout="actionsLayout"
          >
            <slot name="actions" />
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<!--
  这里不能用 scoped：Vue 会把 scoped 块里的 @keyframes 重命名成带 hash 的名字，
  而 UnoCSS 的 @apply 在其之后才展开，animation 仍指向原名 => 动画不存在，
  reka-ui 的 Presence 永远等不到 animationend，关闭时弹窗无法卸载。
-->
<style lang="scss">
.ui-dialog-overlay {
  top: var(--window-titlebar-height, 40px);
}

.ui-dialog-content {
  @apply border-solid border-$ui-border shadow-$shadow-dialog;
  top: calc(var(--window-titlebar-height, 40px) + 50%);

  &[data-state="open"] {
    @apply animate-[dialog-enter_140ms_cubic-bezier(0.16,1,0.3,1)];
  }

  &[data-state="closed"] {
    @apply animate-[dialog-exit_100ms_ease-in];
  }
}

.ui-dialog-actions-end {
  &[data-layout="reverse"] {
    @apply flex-row-reverse;
  }

  &[data-layout="end"] {
    @apply justify-end;
  }
}

@keyframes dialog-enter {
  from {
    @apply opacity-0;
    transform: translate(-50%, calc(-50% + 6px)) scale(0.985);
  }
}

@keyframes dialog-exit {
  to {
    @apply opacity-0;
    transform: translate(-50%, calc(-50% + 4px)) scale(0.985);
  }
}
</style>
