<script lang="ts" setup>
import { JeLine } from 'jetv-ui'

defineProps<{
  title: string
}>()
</script>

<template>
  <div flex="~ col" gap="8px" w-full>
    <div flex="~ row items-center" gap="8px" text="default">
      {{ title }}

      <JeLine grow />
    </div>

    <div settings-section flex="~ col" gap="8px">
      <slot />
    </div>
  </div>
</template>
