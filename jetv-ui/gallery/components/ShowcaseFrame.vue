<script lang="ts" setup>
import { JeFrame } from '../../src'
</script>

<template>
  <JeFrame
    type="primary" flex="~ col" gap="y-20px" h-full p="y-10px"
    box-border overflow-auto
  >
    <slot />
  </JeFrame>
</template>

<style lang="scss" scoped>

</style>
