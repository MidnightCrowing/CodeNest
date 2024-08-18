<script setup lang="ts">
import Button from '~/components/common/Button.vue'
import Tag from '~/components/common/Tag.vue'

interface TagType {
  icon?: string
  content: string
  annotation?: string
  deleteAble?: boolean
  selectAble?: boolean
  isSelected?: boolean
}

const tags: Ref<TagType[]> = ref([
  {
    icon: 'i-static-jetbrains-aqua',
    content: 'Tag 1',
    annotation: '注释1',
    deleteAble: true,
    selectAble: true,
    isSelected: true,
  },
  {
    icon: 'i-static-jetbrains-fleet',
    content: 'Tag 2',
    deleteAble: true,
    selectAble: true,
    isSelected: false,
  },
  {
    icon: 'i-static-jetbrains-rubymine',
    content: 'Tag 3',
    annotation: '注释3',
    deleteAble: false,
    selectAble: true,
    isSelected: false,
  },
  {
    icon: 'i-static-jetbrains-rider',
    content: 'Tag 4',
    annotation: '注释4',
    deleteAble: true,
    selectAble: false,
    isSelected: false,
  },
  {
    icon: 'i-static-visual-studio',
    content: 'Tag 5',
    annotation: '注释5',
    deleteAble: false,
    selectAble: false,
    isSelected: false,
  },
])

function handleRemove(index: number) {
  tags.value.splice(index, 1)
}

function handleSelect(index: number, isSelected: boolean) {
  tags.value[index].isSelected = isSelected
}

function getTagInfo() {
  return tags.value.map(tag => ({
    content: tag.content,
    annotation: tag.annotation,
    isSelected: tag.isSelected,
  }))
}
</script>

<template>
  <div>
    <Tag
      v-for="(tag, index) in tags"
      :key="index"
      :icon="tag.icon"
      :content="tag.content"
      :annotation="tag.annotation"
      :delete-able="tag.deleteAble"
      :select-able="tag.selectAble"
      :select="tag.isSelected"
      @remove="handleRemove(index)"
      @select="handleSelect(index, $event)"
    />
    <Button @click="getTagInfo">
      Get Tags Information
    </Button>
  </div>
</template>
