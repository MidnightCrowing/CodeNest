<script lang="ts" setup>
import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'

import type { UiToastTone } from './toast'
import {
  dismissOverflowToast,
  dismissToast,
  overflowToastCount,
  overflowToastVersion,
  toasts,
} from './toast'

const { t } = useI18n()

function toastIcon(tone: UiToastTone) {
  switch (tone) {
    case 'success':
      return 'i-lucide:circle-check'
    case 'warning':
      return 'i-lucide:triangle-alert'
    case 'error':
      return 'i-lucide:circle-alert'
    case 'info':
    default:
      return 'i-lucide:info'
  }
}
</script>

<template>
  <ToastProvider :label="t('app.common.notifications')" :duration="3800" swipe-direction="right">
    <ToastRoot
      v-for="toast in toasts"
      :key="`${toast.id}-${toast.version}`"
      class="ui-toast"
      :class="toast.tone"
      :duration="toast.duration"
      type="foreground"
      @update:open="open => !open && dismissToast(toast.id)"
    >
      <span class="ui-toast-icon">
        <span class="ui-toast-symbol" :class="toastIcon(toast.tone)" />
      </span>
      <div class="ui-toast-copy">
        <ToastTitle class="ui-toast-title">
          <span class="ui-toast-title-text">{{ toast.title }}</span>
          <span v-if="toast.count > 1" class="ui-toast-count">x{{ toast.count }}</span>
        </ToastTitle>
        <ToastDescription v-if="toast.description" class="ui-toast-description">
          {{ toast.description }}
        </ToastDescription>
        <ToastAction
          v-if="toast.action"
          as-child
          :alt-text="toast.action.altText || toast.action.label"
        >
          <button class="ui-toast-action" type="button" @click="toast.action.onSelect">
            {{ toast.action.label }}
          </button>
        </ToastAction>
      </div>
      <ToastClose as-child>
        <button class="ui-toast-close" type="button" :aria-label="t('app.common.close')">
          <span class="i-lucide:x" />
        </button>
      </ToastClose>
    </ToastRoot>

    <ToastRoot
      v-if="overflowToastCount > 0"
      :key="`overflow-${overflowToastVersion}`"
      class="ui-toast ui-toast-overflow info"
      :duration="3200"
      type="foreground"
      @update:open="open => !open && dismissOverflowToast()"
    >
      <span class="ui-toast-icon">
        <span class="ui-toast-symbol i-lucide:layers-2" />
      </span>
      <div class="ui-toast-copy">
        <ToastTitle class="ui-toast-title">
          <span class="ui-toast-title-text">
            {{ t('app.common.more_notifications', { count: overflowToastCount }) }}
          </span>
        </ToastTitle>
      </div>
      <ToastClose as-child>
        <button class="ui-toast-close" type="button" :aria-label="t('app.common.close')">
          <span class="i-lucide:x" />
        </button>
      </ToastClose>
    </ToastRoot>

    <div class="ui-toast-layer">
      <ToastViewport class="ui-toast-viewport" />
    </div>
  </ToastProvider>
</template>

<style lang="scss">
.ui-toast-layer {
  @apply fixed z-1000 w-360px max-w-[calc(100vw-32px)];
  right: calc(env(safe-area-inset-right, 0px) + 16px);
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  @apply pointer-events-none;
}

.ui-toast-viewport {
  @apply m-0 flex w-full list-none flex-col-reverse gap-8px p-0 outline-none;
  @apply pointer-events-auto;
}

.ui-toast {
  @apply relative grid min-h-54px grid-cols-[22px_minmax(0,1fr)_22px] items-start gap-10px rounded-8px border px-13px py-12px;
  @apply overflow-hidden border-solid color-$ui-foreground;
  border-color: color-mix(in srgb, var(--ui-border) 82%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 8%), transparent 46%),
    color-mix(in srgb, var(--ui-surface-background) 94%, var(--blue-12));
  box-shadow:
    0 22px 58px rgb(31 35 40 / 15%),
    0 7px 20px rgb(31 35 40 / 9%),
    0 1px 1px rgb(0 0 0 / 6%),
    inset 0 1px 0 rgb(255 255 255 / 52%);
  backdrop-filter: blur(18px) saturate(118%);

  &::before {
    @apply absolute left-0 top-10px bottom-10px w-3px rounded-r-full;
    content: "";
    background: color-mix(in srgb, var(--toast-tone) 72%, transparent);
  }

  &[data-state="open"] {
    @apply animate-[toast-enter_210ms_cubic-bezier(0.18,0.92,0.22,1)];
  }

  &[data-state="closed"] {
    @apply animate-[toast-exit_140ms_cubic-bezier(0.4,0,1,1)];
  }

  &[data-swipe="move"] {
    transform: translateX(var(--reka-toast-swipe-move-x));
  }

  &[data-swipe="cancel"] {
    @apply translate-x-0;
    @apply transition-transform duration-120 ease-out;
  }

  &[data-swipe="end"] {
    @apply animate-[toast-swipe-out_120ms_ease-out];
  }

  &.success {
    --toast-tone: var(--green-4);
  }

  &.warning {
    --toast-tone: color-mix(in srgb, var(--yellow-2) 72%, var(--orange-3));
  }

  &.error {
    --toast-tone: var(--red-4);
  }

  &.info {
    --toast-tone: var(--ui-primary);
  }
}

:root.dark .ui-toast {
  border-color: color-mix(in srgb, var(--ui-border) 86%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 3%), transparent 48%),
    color-mix(in srgb, var(--ui-surface-background) 94%, var(--ui-page-background));
  box-shadow:
    0 28px 70px rgb(0 0 0 / 54%),
    0 10px 26px rgb(0 0 0 / 34%),
    0 1px 1px rgb(0 0 0 / 40%),
    inset 0 1px 0 rgb(255 255 255 / 5%);
  backdrop-filter: blur(18px) saturate(108%);
}

:root.dark .ui-toast.success {
  --toast-tone: var(--green-10);
}

:root.dark .ui-toast.warning {
  --toast-tone: var(--yellow-10);
}

:root.dark .ui-toast.error {
  --toast-tone: var(--red-10);
}

:root.dark .ui-toast.info {
  --toast-tone: var(--ui-primary);
}

.ui-toast-icon {
  @apply mt-1px size-22px inline-flex items-center justify-center color-$toast-tone;
  filter: saturate(1.12);
}

.ui-toast-icon .ui-toast-symbol {
  @apply block size-16px color-$toast-tone;
  background-color: currentColor;
}

.ui-toast-copy {
  @apply min-w-0 flex flex-col gap-2px;
}

.ui-toast-title {
  @apply flex min-w-0 items-center gap-6px text-13px font-650 lh-18px tracking-0;
  @apply break-anywhere;
}

.ui-toast-title-text {
  @apply min-w-0;
}

.ui-toast-count {
  @apply inline-flex shrink-0 items-center rounded-full px-5px py-1px text-10px font-700 lh-12px;
  @apply color-$toast-tone;
  background: color-mix(in srgb, var(--toast-tone) 14%, transparent);
}

.ui-toast-description {
  @apply text-12px lh-17px tracking-0 color-$ui-muted-foreground;
  @apply break-anywhere;
}

.ui-toast-action {
  @apply mt-5px w-fit rounded-5px border-0 bg-transparent px-0 py-1px;
  @apply cursor-pointer text-12px font-650 color-$ui-primary;
  @apply hover:color-$ui-primary-hover;
}

.ui-toast-close {
  @apply size-22px rounded-full border-0 bg-transparent p-0;
  @apply inline-flex cursor-pointer items-center justify-center;
  color: color-mix(in srgb, var(--ui-muted-foreground) 76%, var(--ui-foreground));
  @apply hover:bg-$ui-hover-background hover:color-$ui-foreground;
}

@keyframes toast-enter {
  from {
    @apply opacity-0;
    transform: translate(16px, 10px) scale(0.985);
  }
}

@keyframes toast-exit {
  to {
    @apply opacity-0;
    transform: translate(14px, 8px) scale(0.985);
  }
}

@keyframes toast-swipe-out {
  to {
    @apply opacity-0;
    transform: translateX(calc(var(--reka-toast-swipe-end-x) + 24px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-toast[data-state="open"],
  .ui-toast[data-state="closed"],
  .ui-toast[data-swipe="end"] {
    animation-duration: 1ms;
  }
}
</style>
