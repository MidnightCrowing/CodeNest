<script lang="ts" setup>
import JeTag from './Tag.vue'
import type { SlimTagProps } from './types'

withDefaults(defineProps<SlimTagProps>(), {
  deleteAble: false,
  selectAble: false,
  select: false,
  disabled: false,
})
const emit = defineEmits(['remove', 'select'])

/**
 * 处理删除事件
 * @param tag 当前删除的标签对象
 */
function handleRemove(tag: SlimTagProps) {
  emit('remove', tag) // 向父组件传递删除事件
}

/**
 * 处理选择事件
 * @param tag 当前选择的标签对象
 * @param isSelected 标签的选中状态
 */
function handleSelect(tag: SlimTagProps, isSelected: boolean) {
  emit('select', tag, isSelected) // 向父组件传递选择事件
}
</script>

<template>
  <JeTag
    class="je-tag--slim"
    :select-able="selectAble"
    :select="select"
    :delete-able="deleteAble"
    :disabled="disabled"
    @remove="handleRemove"
    @select="handleSelect"
  >
    <slot />
  </JeTag>
</template>

<style lang="scss" scoped>
.je-tag--slim {
  @apply px-4px py-2px rounded-2px;
}
</style>
