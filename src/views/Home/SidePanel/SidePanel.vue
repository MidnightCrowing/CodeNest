<script setup lang="ts">
import Hr from '~/components/common/Hr.vue'

import KindGroup from './components/KindGroup.vue'
import LanguagesGroup from './components/LanguagesGroup.vue'
import { KindMark } from './constants'
import type { ActivatedItem, ItemMark } from './types'

const activatedItem: ActivatedItem = ref(KindMark.ALL)

function updateActivatedItem(itemMark: ItemMark) {
  if (activatedItem.value !== itemMark)
    activatedItem.value = itemMark
}

provide('activatedItem', activatedItem)
provide('updateActivatedItem', updateActivatedItem)
</script>

<template>
  <div class="side-panel">
    <KindGroup />
    <Hr />
    <LanguagesGroup />
  </div>
</template>

<style scoped lang="scss">
.side-panel {
  --uno: "bg-$bg-1";
  --uno: "py-8px";

  // 滚动条设置
  --uno: "overflow-y-auto";
  --uno: "scrollbar:w-5px ";
  // --uno: "scrollbar-thumb:rounded-5px";
  --uno: "scrollbar-track:bg-transparent";
  --uno: "scrollbar-corner:bg-transparent";
  --uno: "scrollbar-thumb:bg-$scrollbar-thumb";
  --uno: "hover:scrollbar-thumb:bg-$scrollbar-thumb-hover";
}
</style>
