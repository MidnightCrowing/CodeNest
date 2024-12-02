<script lang="ts" setup>
import type { JeColorIconProps } from './types.ts'

withDefaults(defineProps<JeColorIconProps>(), {
  type: 'default',
})
</script>

<template>
  <div
    class="je-color-icon"
    :class="[
      `je-color-icon--${type}`,
      `je-color-icon--color-scheme-${colorScheme}`,
      { 'je-color-icon--color-scheme': colorScheme && !customColor },
    ]"
    :style="{ backgroundColor: customColor }"
  >
    <span v-if="type === 'default'" class="je-color-icon__text">
      <slot />
    </span>
  </div>
</template>

<style lang="scss" scoped>
// Type Style
.je-color-icon {
  &--default {
    @apply font-sans text-13px lh-26px;
    @apply size-1.5rem rounded-4px;
    @apply flex items-center justify-center;

    .je-color-icon__text {
      @apply m-0.5px truncate;
    }
  }

  &--circle {
    @apply size-0.8rem  rounded-full;
  }

  &--vertical-bar {
    @apply h-1.3rem w-3px;
    @apply b-solid b-1px rounded-2px;
    @apply light:b-$gray-10 dark:b-$gray-6;
  }
}

// Color Scheme Style
.je-color-icon--color-scheme {
  @apply bg-gradient-to-b;

  // Amber
  &-amber {
    @apply from-#E08855/100 to-#E9806F/100;
  }

  // Rust
  &-rust {
    @apply from-#B08B14/100 to-#BB7F19/100;
  }

  // Olive
  &-olive {
    @apply from-#A1A359/100 to-#87AA59/100;
  }

  // Grass
  &-grass {
    @apply from-#5FAD65/100;
    @apply light:to-#3D968B/100 dark:to-#274729/100;
  }

  // Ocean
  &-ocean {
    @apply bg-$teal-primary;
  }

  // Sky
  &-sky {
    @apply from-#3B92B8/100 to-#6183EC/100;
  }

  // Cobalt
  &-cobalt {
    @apply from-#3574F0/100 to-#7A64F0/100;
  }

  // Violet
  &-violet {
    @apply from-#874ECE/100 to-#963DCC/100;
  }

  // Plum
  &-plum {
    @apply from-#C84D8F/100 to-#A956CF/100;
  }
}
</style>
