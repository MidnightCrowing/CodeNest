<script lang="ts" setup>
import { JeLink } from '../index'
import type { Action, Banner } from './types'

withDefaults(defineProps<Banner>(), {
  actions: () => [] as Action[],
  type: 'default',
})

const isVisible = ref(true)

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <div
    v-if="isVisible"
    class="je-banner"
    :class="[state, type]"
  >
    <div class="banner-content">
      <!-- State Icon -->
      <div class="state-icon" />

      <div class="banner-text">
        <!-- Label -->
        <span class="banner-label">{{ label }}</span>

        <!-- Actions -->
        <div class="banner-actions">
          <JeLink
            v-for="(action, index) in actions"
            :key="index"
            class="action"
            :on-click="action.onClick"
          >
            {{ action.label }}
          </JeLink>
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <div class="close-button-wrapper">
      <div class="close-button" @click="handleClose" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-banner {
  @apply font-sans text-13px lh-25px;
  @apply b-solid b-2px px-13px py-9px box-border;
  @apply flex gap-8px;

  // Type Style
  &.default {
    @apply w-full b-x-none;
    @apply items-center;

    .banner-content {
      @apply grow;
      @apply flex items-center gap-8px;

      .banner-text {
        @apply grow;
        @apply flex justify-between items-center;
        @apply truncate;
      }
    }
  }

  &.inline {
    @apply rounded-10px;
    @apply items-start;

    .banner-content {
      @apply grow;
      @apply flex items-start gap-8px;

      .banner-text {
        @apply grow;
        @apply flex flex-col items-start;
      }
    }

    .state-icon,
    .close-button-wrapper {
      @apply my-2px;
    }
  }

  // State Style
  &.info {
    // light
    @apply light:bg-$blue-13 light:b-$blue-10;

    // dark
    @apply dark:bg-$blue-1 dark:b-$blue-3;

    .banner-content {
      .state-icon {
        @apply light:i-jet:info dark:i-jet:info-dark;
        @apply light:size-1rem dark:size-1rem;
      }
    }
  }

  &.success {
    // light
    @apply light:bg-$green-11 light:b-$green-9;

    // dark
    @apply dark:bg-$green-1 dark:b-$green-3;

    .banner-content {
      .state-icon {
        @apply light:i-jet:success dark:i-jet:success-dark;
        @apply light:size-1rem dark:size-1rem;
      }
    }
  }

  &.warning {
    // light
    @apply light:bg-$yellow-10 light:b-$yellow-6;

    // dark
    @apply dark:bg-$yellow-1 dark:b-$yellow-3;

    .banner-content {
      .state-icon {
        @apply light:i-jet:warning dark:i-jet:warning-dark;
        @apply light:size-1rem dark:size-1rem;
      }
    }
  }

  &.error {
    // light
    @apply light:bg-$red-11 light:b-$red-9;

    // dark
    @apply dark:bg-$red-1 dark:b-$red-3;

    .banner-content {
      .state-icon {
        @apply light:i-jet:error dark:i-jet:error-dark;
        @apply light:size-1rem dark:size-1rem;
      }
    }
  }

  // State Icon Style
  .state-icon {
    @apply size-min-1.25rem;
  }

  // Actions Style
  .banner-actions {
    @apply flex items-center gap-13px;
  }

  // Label Style
  .banner-label {
    @apply light:color-$gray-1 dark:color-$gray-12;
  }

  // Close Button Style
  .close-button-wrapper {
    @apply flex items-center justify-center;
    @apply size-min-1.25rem rounded-4px;
    @apply hover:bg-$toolbar-hover active:bg-$toolbar-active;
    @apply cursor-pointer;

    .close-button {
      @apply text-0.9rem;
      @apply light:i-jet:close dark:i-jet:close-dark;
    }
  }
}
</style>
