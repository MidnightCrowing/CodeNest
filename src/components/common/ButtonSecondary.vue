<script setup lang="ts">
import ButtonBase from './ButtonBase.vue'
</script>

<template>
  <ButtonBase
    bg="theme-field-bg"
    outline="~ 2px theme-button-borderSecondary active:theme-button-borderActiveSecondary"
    m="2px"
  >
    <slot />
  </ButtonBase>
</template>
