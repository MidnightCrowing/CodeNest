<script setup lang="ts">
import type { ActivatedItem, Language } from '../types'

defineProps<{
  activatedLanguage: ActivatedItem
  updateLanguage: (language: Language) => void

}>()
</script>

<template>
  Hello World
</template>

<style scoped lang="scss">
</style>
