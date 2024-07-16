<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import KindGroup from './components/KindGroup.vue'
import LanguagesGroup from './components/LanguagesGroup.vue'
import type { ActivatedItem, GroupItem } from './types'
import { Kind } from './types'

const { t } = useI18n()

const activatedItem: ActivatedItem = ref(Kind.all)

function updateActivatedItem(item: GroupItem) {
  if (activatedItem.value !== item)
    activatedItem.value = item
}

provide('activatedItem', activatedItem)
provide('updateActivatedItem', updateActivatedItem)
</script>

<template>
  <div class="side-panel">
    <header
      text="14px" lh="20px"
      color="#8d96a0"
      p="x-16px t-16px b-4px"
    >
      {{ t('side_panel.project') }}
    </header>
    <main p="y-8px">
      <KindGroup />
      <hr hr m="x-16px">
      <LanguagesGroup />
    </main>
  </div>
</template>

<style scoped lang="scss">
.side-panel {
  --uno: "bg-$bg-2";
  --uno: "relative top-1px";
  --uno: "rounded-r-5px";

  // 滚动条设置
  --uno: "overflow-y-auto";
  --uno: "scrollbar:w-5px";
  --uno: "scrollbar-track:bg-transparent";
  --uno: "scrollbar-corner:bg-transparent";
  --uno: "scrollbar-thumb:bg-$scrollbar-thumb";
  --uno: "hover:scrollbar-thumb:bg-$scrollbar-thumb-hover";

  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
  }
}
</style>
