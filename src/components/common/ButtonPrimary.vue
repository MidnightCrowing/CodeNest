<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'
</script>

<template>
  <ButtonBase
    bg="theme-button-bgPrimary active:theme-button-bgActivePrimary"
    color="common-text-white"
    outline="~ 2px theme-button-borderPrimary"
    m="2px"
  >
    <slot />
  </ButtonBase>
</template>
