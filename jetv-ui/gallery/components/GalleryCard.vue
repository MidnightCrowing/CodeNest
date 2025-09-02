<script setup lang="ts">
import { JeFrame } from '../../src'

withDefaults(defineProps<{
  title: string
  type?: 'primary' | 'secondary'
}>(), {
  type: 'secondary',
})
</script>

<template>
  <div
    flex="~ col items-start justify-center" gap="8px"
  >
    <span v-if="title" text="h2" m="l-5px">
      {{ title }}
    </span>
    <JeFrame
      :type="type"
      w-full box-border p="20px" rounded="5px"
      flex="~ col items-start" gap="20px"
      :style="{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)' }"
    >
      <slot />
    </JeFrame>
  </div>
</template>
