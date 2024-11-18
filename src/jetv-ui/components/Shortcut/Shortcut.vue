<script lang="ts" setup>
import type { Shortcut } from './type'

withDefaults(defineProps<Shortcut>(), {
  type: 'outline',
})

/**
 * 将字符串的首字母转换为大写
 * @param str - 需要转换的字符串
 * @returns {string} 转换后的字符串
 */
function capitalize(str: string): string {
  if (str.length === 0)
    return str // 如果字符串为空，直接返回原字符串
  return str.charAt(0).toUpperCase() + str.slice(1) // 首字母大写，其余部分不变
}
</script>

<template>
  <div class="je-shortcut" :class="type">
    <span
      v-for="(key, index) in keys"
      :key="index"
      class="shortcut-key"
    >
      {{ capitalize(key) }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.je-shortcut {
  @apply font-mono text-13px;
  @apply flex items-center gap-3px;
  @apply outline-none;
  @apply light:color-$gray-1 dark:color-$gray-12;

  .shortcut-key {
    @apply b-solid b-2px b-transparent box-border;
    @apply px-7px py-1px rounded-4px;
  }

  &.default .shortcut-key {
    @apply light:bg-$gray-11 dark:bg-$gray-5;
  }

  &.outline .shortcut-key {
    @apply light:b-$gray-11 dark:b-$gray-5;
  }
}
</style>
