<script setup lang="ts">
import type { KindMenuList, KindMenuMark } from '../constants'
import { kindMenuMarkMap } from '../constants'
import type { ActivatedMenuItem, KindMenuItem } from '../types'

defineProps<{
  kindItem: KindMenuItem
}>()

const activatedItem = inject<ActivatedMenuItem>('activatedItem')
const updateKind = inject<(kindMark: KindMenuMark) => void>('updateActivatedItem', () => {})

function handleKindItemClick(kind: KindMenuList) {
  updateKind(kindMenuMarkMap[kind])
}
</script>

<template>
  <div
    :class="[
      activatedItem === `k-${kindItem.kind}`
        ? 'bg-theme-dropdown-bgSelected'
        : 'bg-transparent hover:bg-theme-button-bgHoverTertiary active:bg-theme-button-bgActiveTertiary',
    ]"
    h="20px" m="x-8px" p="x-20px y-6px" rounded="4px"
    flex="~ items-center justify-between"
    cursor-pointer
    @click="handleKindItemClick(kindItem.kind)"
  >
    {{ kindItem.i18nKey }}
    <span
      bg="#afc8e14d"
      h="17px" m="l-8px" p="x-8px" rounded="16px"
      text="12px" font="600"
    >
      11
    </span>
  </div>
</template>
