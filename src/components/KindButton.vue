<script setup lang="ts">
import type { ActivatedItem, Kind, KindItem } from '../views/SidePanel/types'
import { KindMark } from '../views/SidePanel/types'

defineProps<{
  kindItem: KindItem
}>()

const activatedItem = inject<ActivatedItem>('activatedItem')
const updateKind = inject<(kindMark: KindMark) => void>('updateActivatedItem', () => {})

function handleKindItemClick(kind: Kind) {
  updateKind({
    'all': KindMark.all,
    'mine': KindMark.mine,
    'fork': KindMark.fork,
    'clone': KindMark.clone,
    'test': KindMark.test,
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
  --uno: "text-default cursor-pointer";

  &.active {
    --uno: "bg-$select-3";
  }
}
</style>
