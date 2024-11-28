<script lang="ts" setup>
import { ref } from 'vue'

import { JeSlimTag } from '../index'

// 模拟标签数据
const tags = ref([
  { label: 'Tag 1', selected: false },
  { label: 'Tag 2', selected: false },
  { label: 'Tag 3', selected: false },
])

// 处理标签选中事件
function handleSelect(tag: { label: string, selected: boolean }, isSelected: boolean) {
  tag.selected = isSelected
}

// 处理标签删除事件
function handleRemove(tag: { label: string, selected: boolean }) {
  const index = tags.value.findIndex(t => t.label === tag.label)
  if (index !== -1) {
    tags.value.splice(index, 1)
  }
}
</script>

<template>
  <JeSlimTag
    v-for="(tag, index) in tags"
    :key="index"
    :select-able="true"
    :select="tag.selected"
    :delete-able="true"
    @remove="handleRemove(tag)"
    @select="handleSelect(tag, $event)"
  >
    {{ tag.label }}
  </JeSlimTag>
</template>
