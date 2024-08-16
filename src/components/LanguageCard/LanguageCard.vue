<script setup lang="ts">
import { Shape } from './constants'

defineProps<{
  languageColor: string
  shape?: Shape
}>()

function addAlphaToColor(color: string, alpha: number) {
  // 将十六进制颜色转换为 RGB
  const r = Number.parseInt(color.slice(1, 3), 16)
  const g = Number.parseInt(color.slice(3, 5), 16)
  const b = Number.parseInt(color.slice(5, 7), 16)

  // 返回 RGBA 字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<template>
  <template v-if="shape === Shape.VERTICAL_BAR">
    <div
      h="18px" w="2px"
      border="solid 1px #ffffff26" rounded="1px"
      :style="{ backgroundColor: languageColor }"
    />
  </template>

  <template v-else-if="shape === Shape.BLOCK">
    <div
      size="10px"
      border="solid 2px" rounded="2px"
      :style="{ backgroundColor: addAlphaToColor(languageColor, 0.5),
                borderColor: languageColor }"
    />
  </template>

  <template v-else>
    <div
      size="10px"
      border="solid 1px #ffffff26" rounded="8px"
      :style="{ backgroundColor: languageColor }"
    />
  </template>
</template>
