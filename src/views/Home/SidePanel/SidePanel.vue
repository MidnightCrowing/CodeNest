<script setup lang="ts">
import Hr from '~/components/common/Hr.vue'

import KindGroup from './components/KindMenuGroup.vue'
import LanguagesGroup from './components/LanguageMenuGroup.vue'
import { KindMenuMark } from './constants'
import type { ActivatedMenuItem, ItemMenuMark } from './types'

const activatedMenuValue: ActivatedMenuItem = ref(KindMenuMark.ALL)

function updateActivatedItem(itemMark: ItemMenuMark) {
  if (activatedMenuValue.value !== itemMark)
    activatedMenuValue.value = itemMark
}

provide('activatedItem', activatedMenuValue)
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
