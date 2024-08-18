<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'
</script>

<template>
  <ButtonBase
    bg="theme-button-default active:theme-button-defaultActive"
    color="default-text-white"
    outline="~ 2px theme-button-default"
    m="2px"
  >
    <slot />
  </ButtonBase>
</template>
