<script lang="ts" setup>
import { useRouter } from 'vue-router'

defineProps<{
  value: string
  label: string
  link: string
}>()

const router = useRouter()
</script>

<template>
  <div
    class="sidebar-menu-item"
    :class="{ active: $route.fullPath === link }"
    :tabindex="0"
    w-full box-border
    b="solid x-0 y-2px transparent" p="x-20px y-6px"
    focus-visible:b="light:$blue-4 dark:$blue-6" focus-visible:outline-0
    cursor-pointer
    @click="router.push(value)"
    @keydown.enter="router.push(value)"
  >
    {{ label }}
  </div>
</template>

<style lang="scss" scoped>
.sidebar-menu-item.active {
  @apply light:bg-$blue-11 dark:bg-$blue-2;
}
</style>
