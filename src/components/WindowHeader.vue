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
    data-tauri-drag-region
  >
    <span class="window-title" data-tauri-drag-region>CodeNest</span>

    <div class="window-controls">
      <button class="window-control" type="button" :aria-label="t('app.window.minimize')" @click="minimizeWindow">
        <span class="window-control-icon minimize" />
      </button>
      <button class="window-control" type="button" :aria-label="t('app.window.maximize')" @click="toggleMaximizeWindow">
        <span class="window-control-icon maximize" />
      </button>
      <button class="window-control close" type="button" :aria-label="t('app.window.close')" @click="closeWindow">
        <span class="window-control-icon close-icon" />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.window-header {
  @apply h-40px w-full shrink-0 flex items-center;
  @apply bg-$ui-page-background;
  -webkit-app-region: drag;
  -webkit-user-select: none;
}

.window-controls {
  @apply h-full ml-auto flex items-center;
  -webkit-app-region: no-drag;
}

.window-title {
  @apply relative left-30px lh-20px text-13px font-500;
  font-family: var(--font-title);
}

.window-control {
  @apply relative h-full w-46px border-0 bg-transparent p-0;
  @apply flex items-center justify-center;
  @apply color-$gray-1 dark:color-$gray-11;

  &:hover {
    @apply bg-$ui-hover-background;
  }

  &.close:hover {
    @apply bg-$red-5 color-white;
  }
}

.window-control-icon {
  @apply relative block size-12px;
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
