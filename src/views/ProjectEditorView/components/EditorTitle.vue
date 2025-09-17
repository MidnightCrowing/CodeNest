<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps<{
  title: string
}>()

const { t } = useI18n()
</script>

<template>
  <span self-center text-nowrap> {{ t(title) }}: </span>
</template>
