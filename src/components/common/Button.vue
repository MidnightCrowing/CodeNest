<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'
</script>

<template>
  <ButtonBase
    bg-transparent
    outline="~ 2px theme-button-border active:theme-button-borderActive"
    m="2px"
  >
    <slot />
  </ButtonBase>
</template>
