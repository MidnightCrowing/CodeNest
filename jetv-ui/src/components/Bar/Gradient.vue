<script lang="ts" setup>
import type { JeGradientProps } from './types.ts'

defineProps<JeGradientProps>()
</script>

<template>
  <div class="je-gradient" :class="[`je-gradient--color-scheme-${colorScheme}`]">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.je-gradient {
  @apply bg-gradient-to-r;
}

.je-gradient--color-scheme {
  // Amber
  &-amber {
    @apply light:from-#F5D4C1/0 light:via-#F5D4C1/100 light:to-#F5D4C1/0;
    @apply dark:from-#654B40/0 dark:via-#654B40/100 dark:to-#654B40/0;
    @apply light:via-21% dark:via-21%;
  }

  // Rust
  &-rust {
    @apply light:from-#EEE2BD/0 light:via-#EEE2BD/100 light:to-#EEE2BD/0;
    @apply dark:from-#534C33/0 dark:via-#534C33/100 dark:to-#534C33/0;
    @apply light:via-21% dark:via-21%;
  }

  // Olive
  &-olive {
    @apply light:from-#DBE7C9/0 light:via-#DBE7C9/100 light:to-#DBE7C9/0;
    @apply dark:from-#455038/0 dark:via-#455038/100 dark:to-#455038/0;
    @apply light:via-21% dark:via-21%;
  }

  // Grass
  &-grass {
    @apply light:from-#CCEBD1/0 light:via-#CCEBD1/100 light:to-#CCEBD1/0;
    @apply dark:from-#3E5540/0 dark:via-#3E5540/100 dark:to-#3E5540/0;
    @apply light:via-21% dark:via-21%;
  }

  // Ocean
  &-ocean {
    @apply light:from-#BEE4E1/0 light:via-#BEE4E1/100 light:to-#BEE4E1/0;
    @apply dark:from-#1D4744/0 dark:via-#1D4744/100 dark:to-#1D4744/0;
    @apply light:via-21% dark:via-21%;
  }

  // Sky
  &-sky {
    @apply light:from-#CADFEA/0 light:via-#CADFEA/100 light:to-#CADFEA/0;
    @apply dark:from-#31515F/0 dark:via-#31515F/100 dark:to-#31515F/0;
    @apply light:via-21% dark:via-21%;
  }

  // Cobalt
  &-cobalt {
    @apply light:from-#DBD8EF/0 light:via-#DBD8EF/100 light:to-#DBD8EF/0;
    @apply dark:from-#344C7D/0 dark:via-#344C7D/100 dark:to-#344C7D/0;
    @apply light:via-21% dark:via-21%;
  }

  // Violet
  &-violet {
    @apply light:from-#DFCCF4/0 light:via-#DFCCF4/100 light:to-#DFCCF4/0;
    @apply dark:from-#4F3E65/0 dark:via-#4F3E65/100 dark:to-#4F3E65/0;
    @apply light:via-21% dark:via-21%;
  }

  // Plum
  &-plum {
    @apply light:from-#EED7F5/0 light:via-#EED7F5/100 light:to-#EED7F5/0;
    @apply dark:from-#5D354A/0 dark:via-#5D354A/100 dark:to-#5D354A/0;
    @apply light:via-21% dark:via-21%;
  }
}
</style>
