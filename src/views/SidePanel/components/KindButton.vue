<script setup lang="ts">
import type { ProjectKind } from '~/constants/projectKind'

import { KindMark } from '../constants'
import type { ActivatedItem, KindItem } from '../types'

defineProps<{
  kindItem: KindItem
}>()

const activatedItem = inject<ActivatedItem>('activatedItem')
const updateKind = inject<(kindMark: KindMark) => void>('updateActivatedItem', () => {})

function handleKindItemClick(kind: ProjectKind) {
  updateKind({
    'all': KindMark.ALL,
    'mine': KindMark.MINE,
    'fork': KindMark.FORK,
    'clone': KindMark.CLONE,
    'test': KindMark.TEST,
  }[kind])
}
</script>

<template>
  <div
    class="kind-item"
    :class="{ active: activatedItem === `k-${kindItem.kind}` }"
    @click="handleKindItemClick(kindItem.kind)"
  >
    {{ kindItem.i18nKey }}
    <span
      h="17px" m="l-8px" p="x-8px" rounded="16px"
      bg="#afc8e14d"
      text="12px" font="600"
    >
      4k
    </span>
  </div>
</template>

<style scoped lang="scss">
.kind-item {
  --uno: "h-20px mx-8px px-20px py-6px rounded-4px";
  --uno: "bg-$button-bg-1";
  --uno: "hover:bg-$hover-1 active:bg-$active-1";
  --uno: "flex flex-row items-center justify-between";
  --uno: "cursor-pointer";

  &.active {
    --uno: "bg-$select-3";
  }
}
</style>
