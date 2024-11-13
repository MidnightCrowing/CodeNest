<script lang="ts" setup>
import { JeMenu } from './index'
import type { Menu } from './type'

// 接收传入的参数
const props = defineProps<Menu>()
const emit = defineEmits(['update:visible'])

// 在MiniMenu内部使用同步状态
const isVisible = ref(props.visible)

// 当 visible 改变时，通知父组件更新
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal
})

function updateVisibility(status: boolean) {
  isVisible.value = status
  emit('update:visible', status)
}
</script>

<template>
  <JeMenu
    class="mini"
    :visible="isVisible"
    :title="title"
    :options="options"
    :is-child-menu="isChildMenu"
    @update:visible="updateVisibility"
  />
</template>

<style lang="scss">
.je-menu.mini,
.je-menu.mini .je-menu.child {
  @apply px-2px py-5px rounded-0 min-w-100px;

  .option-item .child-menu-wrapper {
    @apply top--6px;
  }
}
</style>
