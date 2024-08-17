<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'
</script>

<template>
  <ButtonBase
    bg="$button-bg-1" color="$text-color-2"
    outline="~ 2px $border-1 active:$border-2"
    m="2px"
  >
    <slot />
  </ButtonBase>
</template>
