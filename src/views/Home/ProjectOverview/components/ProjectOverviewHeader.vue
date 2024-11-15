<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { JeButton, JeCommandLinkButton, JeSearchField } from '~/jetv-ui'

const { t } = useI18n()

const view = inject('view') as Ref<string>

function changeView() {
  if (view)
    view.value = 'NewView'
}
const pathInputValue = ref('')
// 控制菜单的显示/隐藏状态

// // 模拟标签数据
// const tags = ref([
//   { label: 'Tag 1', selected: false },
//   { label: 'Tag 2', selected: false },
//   { label: 'Tag 3', selected: false },
// ])

// // 处理标签选中事件
// function handleSelect(tag: { label: string, selected: boolean }, isSelected: boolean) {
//   tag.selected = isSelected
// }
//
// // 处理标签删除事件
// function handleRemove(tag: { label: string, selected: boolean }) {
//   const index = tags.value.findIndex(t => t.label === tag.label)
//   if (index !== -1) {
//     tags.value.splice(index, 1)
//   }
// }
</script>

<template>
  <div
    flex flex-col gap-10px items-center m-10px
    p-10px
  >
    <JeCommandLinkButton icon="i-jet:jetbrains-pycharm">
      解释运行时错误123131231231231312
    </JeCommandLinkButton>
    <JeCommandLinkButton icon="i-jet:jetbrains-pycharm" :disabled="true">
      解释运行时错误
    </JeCommandLinkButton>
    <JeCommandLinkButton icon="i-jet:jetbrains-pycharm">
      解释运行时错误
    </JeCommandLinkButton>
    <!--    <JeSlimTag -->
    <!--      v-for="(tag, index) in tags" -->
    <!--      :key="index" -->
    <!--      :select-able="true" -->
    <!--      :select="tag.selected" -->
    <!--      :delete-able="true" -->
    <!--      @remove="handleRemove(tag)" -->
    <!--      @select="handleSelect(tag, $event)" -->
    <!--    > -->
    <!--      {{ tag.label }} -->
    <!--    </JeSlimTag> -->
  </div>
  <header
    m="20px"
    flex="~ row justify-between items-center"
    gap="15px"
  >
    <JeSearchField v-model="pathInputValue" type="in-editor" grow />
    <JeButton @click="changeView">
      {{ t('home.header.add_item') }}
    </JeButton>
  </header>
</template>
