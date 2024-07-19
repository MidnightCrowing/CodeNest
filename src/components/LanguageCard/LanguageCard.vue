<script setup lang="ts">
import type { Color } from '../../constants/types'
import { Shape } from './constants'

defineProps<{
  languageColor: Color
  shape?: Shape
}>()
</script>

<template>
  <template v-if="shape === Shape.VERTICAL_BAR">
    <div
      h="18px" w="2px"
      border="solid 1px #ffffff26" rounded="1px"
      :style="{ backgroundColor: languageColor }"
    />
  </template>

  <template v-else>
    <div
      h="10px" w="10px"
      border="solid 1px #ffffff26" rounded="8px"
      :style="{ backgroundColor: languageColor }"
    />
  </template>
</template>
