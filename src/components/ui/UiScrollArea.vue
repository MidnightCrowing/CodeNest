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
  <ScrollAreaRoot class="ui-scroll-root" min-h-0 min-w-0 overflow-hidden :type="type">
    <ScrollAreaViewport class="ui-scroll-viewport" size-full min-h-0 min-w-0>
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      class="ui-scrollbar" z-10 flex touch-none select-none
      p-1px bg-transparent transition-colors orientation="vertical"
    >
      <ScrollAreaThumb
        class="ui-scroll-thumb" relative flex-1 rounded-full light:bg="$gray-9/45"
        dark:bg="$gray-6/50"
      />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      v-if="horizontal"
      class="ui-scrollbar horizontal"
      z-10 flex touch-none select-none p-1px
      bg-transparent transition-colors
      orientation="horizontal"
    >
      <ScrollAreaThumb
        class="ui-scroll-thumb" relative flex-1 rounded-full light:bg="$gray-9/45"
        dark:bg="$gray-6/50"
      />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner v-if="horizontal" bg-transparent />
  </ScrollAreaRoot>
</template>

<style lang="scss">
.ui-scroll-viewport {
  scrollbar-gutter: stable;
}

.ui-scrollbar {
  &[data-orientation="vertical"] {
    @apply w-6px;
  }

  &[data-orientation="horizontal"] {
    @apply h-6px flex-col;
  }
}

.ui-scroll-thumb {
  &:hover {
    @apply light:bg-$gray-7/60 dark:bg-$gray-7/65;
  }
}
</style>
