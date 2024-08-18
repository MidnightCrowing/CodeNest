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
  <div
    bg="theme-panel-bgDialog"
    b-t="solid 1px theme-panel-bgContent" p="y-8px"
    overflow-y-auto scrollbar-thin
  >
    <KindGroup />
    <Hr />
    <LanguagesGroup />
  </div>
</template>
