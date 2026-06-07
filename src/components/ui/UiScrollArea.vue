<script lang="ts" setup>
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui'

withDefaults(defineProps<{
  type?: 'auto' | 'always' | 'scroll' | 'hover'
  horizontal?: boolean
}>(), {
  type: 'auto',
  horizontal: false,
})
</script>

<template>
  <ScrollAreaRoot class="ui-scroll-root" :type="type">
    <ScrollAreaViewport class="ui-scroll-viewport">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar class="ui-scrollbar" orientation="vertical">
      <ScrollAreaThumb class="ui-scroll-thumb" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar v-if="horizontal" class="ui-scrollbar horizontal" orientation="horizontal">
      <ScrollAreaThumb class="ui-scroll-thumb" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner v-if="horizontal" class="ui-scroll-corner" />
  </ScrollAreaRoot>
</template>

<style lang="scss">
.ui-scroll-root {
  @apply min-h-0 min-w-0 overflow-hidden;
}

.ui-scroll-viewport {
  @apply size-full min-h-0 min-w-0;
  scrollbar-gutter: stable;
}

.ui-scrollbar {
  @apply z-10 flex touch-none select-none p-1px;
  @apply bg-transparent transition-colors;

  &[data-orientation="vertical"] {
    @apply w-6px;
  }

  &[data-orientation="horizontal"] {
    @apply h-6px flex-col;
  }
}

.ui-scroll-thumb {
  @apply relative flex-1 rounded-full;
  @apply light:bg-$gray-9/45 dark:bg-$gray-6/50;

  &:hover {
    @apply light:bg-$gray-7/60 dark:bg-$gray-7/65;
  }
}

.ui-scroll-corner {
  @apply bg-transparent;
}
</style>
