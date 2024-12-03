<script lang="ts" setup>
import { JeLink, JeTransparentToolButton } from '../Button'
import type { JeBannerActionProps, JeBannerProps } from './types.ts'

withDefaults(defineProps<JeBannerProps>(), {
  actions: () => [] as JeBannerActionProps[],
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
    :class="[`je-banner--${state}`, `je-banner--${type}`]"
  >
    <div class="je-banner__content">
      <!-- State Icon -->
      <div class="je-banner__icon-state" />

      <div class="je-banner__text">
        <!-- Label -->
        <span class="je-banner__label">
          <slot />
        </span>

        <!-- Actions -->
        <div class="je-banner__actions">
          <JeLink
            v-for="(action, index) in actions"
            :key="index"
            class="je-banner__action"
            :on-click="action.onClick"
          >
            {{ action.label }}
          </JeLink>
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <JeTransparentToolButton
      class="je-banner__close-button"
      icon="light:i-jet:close dark:i-jet:close-dark"
      @click="handleClose"
    />
  </div>
</template>

<style lang="scss" scoped>
.je-banner {
  @apply font-sans text-13px lh-26px;
  @apply b-solid b-2px px-13px py-9px box-border;
  @apply flex gap-8px;
}

// Type Style
.je-banner {
  &--default {
    @apply w-full b-x-none;
    @apply items-center;

    .je-banner__content {
      @apply grow flex items-center gap-8px;

      .je-banner__text {
        @apply grow flex justify-between items-center;
        @apply truncate;
      }
    }
  }

  &--inline {
    @apply rounded-10px;
    @apply items-start;

    .je-banner__content {
      @apply grow flex items-start gap-8px;

      .je-banner__text {
        @apply grow flex flex-col items-start;
      }
    }

    .je-banner__icon-state,
    .je-banner__close-button-wrapper {
      @apply my-2px;
    }
  }
}

// State Style
.je-banner {
  &--info {
    @apply light:bg-$blue-13 light:b-$blue-10;
    @apply dark:bg-$blue-1 dark:b-$blue-3;

    .je-banner__icon-state {
      @apply light:i-jet:info dark:i-jet:info-dark;
    }
  }

  &--success {
    @apply light:bg-$green-11 light:b-$green-9;
    @apply dark:bg-$green-1 dark:b-$green-3;

    .je-banner__icon-state {
      @apply light:i-jet:success dark:i-jet:success-dark;
    }
  }

  &--warning {
    @apply light:bg-$yellow-10 light:b-$yellow-6;
    @apply dark:bg-$yellow-1 dark:b-$yellow-3;

    .je-banner__icon-state {
      @apply light:i-jet:warning dark:i-jet:warning-dark;
    }
  }

  &--error {
    @apply light:bg-$red-11 light:b-$red-9;
    @apply dark:bg-$red-1 dark:b-$red-3;

    .je-banner__icon-state {
      @apply light:i-jet:error dark:i-jet:error-dark;
    }
  }
}

.je-banner__icon-state {
  @apply text-1rem;
  @apply size-min-1.25rem;
}

.je-banner__actions {
  @apply flex items-center gap-13px;
}

.je-banner__label {
  @apply light:color-$gray-1 dark:color-$gray-12;
}
</style>
