<script lang="ts" setup>
import { JeMenu } from './index'
import type { Menu } from './type'

defineProps<Menu>()
</script>

<template>
  <JeMenu class="mini" :title="title" :options="options" />
</template>

<style lang="scss">
.mini,
.je-menu.child {
  @apply px-2px py-5px rounded-0 min-w-100px;
}
</style>
