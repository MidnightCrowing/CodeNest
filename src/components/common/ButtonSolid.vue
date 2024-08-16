<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'
</script>

<template>
  <ButtonBase
    bg="$button-bg-2 active:$active-3"
    color="$text-color-1"
  >
    <slot />
  </ButtonBase>
</template>
