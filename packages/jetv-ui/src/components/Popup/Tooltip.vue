<script lang="ts" setup>
import JePopup from './Popup.vue'
import type { JeTooltipProps } from './types'

withDefaults(defineProps<JeTooltipProps>(), {
  size: 'small',
})
</script>

<template>
  <JePopup
    class="je-tooltip"
    :class="[
      `je-tooltip--${state}`,
      `je-tooltip--${direction}`,
      `je-tooltip--${size}`,
    ]"
  >
    <div v-if="state !== 'info'" class="je-tooltip__icon-state" />
    <div class="je-tooltip__content">
      <slot />
    </div>
  </JePopup>
</template>

<style lang="scss" scoped>
.je-tooltip {
  @apply p-7px min-w-30px min-h-30px;
  @apply flex gap-3px items-start;
  @apply shadow-$shadow-editor-tooltip;

  &::before {
    @apply content-[''];
    @apply absolute rotate-45 z--1;
    @apply b-solid b-1px border-transparent;
  }
}

/* Size Style */
.je-tooltip {
  // Small Size
  &--small::before {
    @apply size-8px;
  }
}

/* Direction Style */
.je-tooltip {
  // Up Direction
  &--up::before {
    @apply bottom-full left-16px translate-y-50%;
  }

  // Down Direction
  &--down::before {
    @apply top-full left-16px translate-y--50%;
  }

  // Left Direction
  &--left::before {
    @apply right-full top-16px translate-x-50%;
  }

  // Right Direction
  &--right::before {
    @apply left-full top-16px translate-x--50%;
  }
}

/* State Style */
.je-tooltip {
  // Info State
  &--info {
    &::before {
      @apply light:bg-$gray-14 dark:bg-$gray-2;
    }

    &.je-tooltip--up::before {
      // light
      @apply light:border-t-$gray-9 light:border-l-$gray-9;

      // dark
      @apply dark:border-t-$gray-3 dark:border-l-$gray-3;
    }

    &.je-tooltip--down::before {
      // light
      @apply light:border-b-$gray-9 light:border-r-$gray-9;

      // dark
      @apply dark:border-b-$gray-3 dark:border-r-$gray-3;
    }

    &.je-tooltip--left::before {
      // light
      @apply light:border-b-$gray-9 light:border-l-$gray-9;

      // dark
      @apply dark:border-b-$gray-3 dark:border-l-$gray-3;
    }

    &.je-tooltip--right::before {
      // light
      @apply light:border-t-$gray-9 light:border-r-$gray-9;

      // dark
      @apply dark:border-t-$gray-3 dark:border-r-$gray-3;
    }
  }

  // Success State
  &--success {
    // light
    @apply light:b-$green-6 light:bg-$green-11;

    // dark
    @apply dark:b-$green-2 dark:bg-$green-1;

    &::before {
      @apply light:bg-$green-11 dark:bg-$green-1;
    }

    &.je-tooltip--up::before {
      // light
      @apply light:border-t-$green-6 light:border-l-$green-6;

      // dark
      @apply dark:border-t-$green-2 dark:border-l-$green-2;
    }

    &.je-tooltip--down::before {
      // light
      @apply light:border-b-$green-6 light:border-r-$green-6;

      // dark
      @apply dark:border-b-$green-2 dark:border-r-$green-2;
    }

    &.je-tooltip--left::before {
      // light
      @apply light:border-b-$green-6 light:border-l-$green-6;

      // dark
      @apply dark:border-b-$green-2 dark:border-l-$green-2;
    }

    &.je-tooltip--right::before {
      // light
      @apply light:border-t-$green-6 light:border-r-$green-6;

      // dark
      @apply dark:border-t-$green-2 dark:border-r-$green-2;
    }
  }

  // Warning State
  &--warning {
    // light
    @apply light:b-$yellow-6 light:bg-$yellow-9;

    // dark
    @apply dark:b-$yellow-2 dark:bg-$yellow-1;

    &::before {
      @apply light:bg-$yellow-9 dark:bg-$yellow-1;
    }

    &.je-tooltip--up::before {
      // light
      @apply light:border-t-$yellow-6 light:border-l-$yellow-6;

      // dark
      @apply dark:border-t-$yellow-2 dark:border-l-$yellow-2;
    }

    &.je-tooltip--down::before {
      // light
      @apply light:border-b-$yellow-6 light:border-r-$yellow-6;

      // dark
      @apply dark:border-b-$yellow-2 dark:border-r-$yellow-2;
    }

    &.je-tooltip--left::before {
      // light
      @apply light:border-b-$yellow-6 light:border-l-$yellow-6;

      // dark
      @apply dark:border-b-$yellow-2 dark:border-l-$yellow-2;
    }

    &.je-tooltip--right::before {
      // light
      @apply light:border-t-$yellow-6 light:border-r-$yellow-6;

      // dark
      @apply dark:border-t-$yellow-2 dark:border-r-$yellow-2;
    }
  }

  // Error State
  &--error {
    // light
    @apply light:b-$red-8 light:bg-$red-10;

    // dark
    @apply dark:b-$red-2 dark:bg-$red-1;

    &::before {
      @apply light:bg-$red-10 dark:bg-$red-1;
    }

    &.je-tooltip--up::before {
      // light
      @apply light:border-t-$red-8 light:border-l-$red-8;

      // dark
      @apply dark:border-t-$red-2 dark:border-l-$red-2;
    }

    &.je-tooltip--down::before {
      // light
      @apply light:border-b-$red-8 light:border-r-$red-8;

      // dark
      @apply dark:border-b-$red-2 dark:border-r-$red-2;
    }

    &.je-tooltip--left::before {
      // light
      @apply light:border-b-$red-8 light:border-l-$red-8;

      // dark
      @apply dark:border-b-$red-2 dark:border-l-$red-2;
    }

    &.je-tooltip--right::before {
      // light
      @apply light:border-t-$red-8 light:border-r-$red-8;

      // dark
      @apply dark:border-t-$red-2 dark:border-r-$red-2;
    }
  }
}

.je-tooltip__icon-state {
  @apply my-1px;

  .je-tooltip--success & {
    @apply light:i-jet:success dark:i-jet:success-dark;
  }

  .je-tooltip--warning & {
    @apply light:i-jet:warning dark:i-jet:warning-dark;
  }

  .je-tooltip--error & {
    @apply light:i-jet:error dark:i-jet:error-dark;
  }
}

.je-tooltip__content {
  @apply grow;
}
</style>
