<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

function minimizeWindow() {
  void window.api.minimizeWindow()
}

function toggleMaximizeWindow() {
  void window.api.toggleMaximizeWindow()
}

function closeWindow() {
  void window.api.closeWindow()
}
</script>

<template>
  <header
    class="window-header"
    h-40px w-full shrink-0 flex items-center
    bg="$ui-page-background"
    data-tauri-drag-region
  >
    <span
      relative left-30px lh-20px text-13px font-500
      font="$font-title"
      data-tauri-drag-region
    >CodeNest</span>

    <div class="window-controls" h-full ml-auto flex items-center>
      <button
        class="window-control"
        relative h-full w-46px border-0 bg-transparent
        p-0
        flex items-center justify-center
        light:color="$gray-1" dark:color="$gray-11"
        type="button"
        :aria-label="t('app.window.minimize')"
        @click="minimizeWindow"
      >
        <span class="window-control-icon minimize" relative block size-12px />
      </button>
      <button
        class="window-control"
        relative h-full w-46px border-0 bg-transparent
        p-0
        flex items-center justify-center
        light:color="$gray-1" dark:color="$gray-11"
        type="button"
        :aria-label="t('app.window.maximize')"
        @click="toggleMaximizeWindow"
      >
        <span class="window-control-icon maximize" relative block size-12px />
      </button>
      <button
        class="window-control close"
        relative h-full w-46px border-0 bg-transparent
        p-0
        flex items-center justify-center
        light:color="$gray-1" dark:color="$gray-11"
        type="button"
        :aria-label="t('app.window.close')"
        @click="closeWindow"
      >
        <span class="window-control-icon close-icon" relative block size-12px />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.window-header {
  -webkit-app-region: drag;
  -webkit-user-select: none;
}

.window-controls {
  -webkit-app-region: no-drag;
}

.window-control {
  &:hover {
    @apply bg-$ui-hover-background;
  }

  &.close:hover {
    @apply bg-$red-5 color-white;
  }
}

.window-control-icon.minimize::before {
  content: "";
  @apply absolute left-1px right-1px top-6px h-1px bg-current;
}

.window-control-icon.maximize::before {
  content: "";
  @apply absolute inset-1px;
  border: 1px solid currentColor;
}

.window-control-icon.close-icon::before,
.window-control-icon.close-icon::after {
  content: "";
  @apply absolute left-1px right-1px top-6px h-1px bg-current;
}

.window-control-icon.close-icon::before {
  @apply rotate-45;
}

.window-control-icon.close-icon::after {
  @apply -rotate-45;
}
</style>
