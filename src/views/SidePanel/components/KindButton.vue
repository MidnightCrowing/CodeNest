<script setup lang="ts">
import type { ActivatedItem, Kind, KindItem } from '../types'

defineProps<{
  kindItem: KindItem
}>()

const activatedItem = inject<ActivatedItem>('activatedItem')
const updateKind = inject<(kind: Kind) => void>('updateActivatedItem', () => {})

function handleKindItemClick(kind: Kind) {
  updateKind(kind)
}
</script>

<template>
  <div
    class="kind-item"
    :class="{ active: activatedItem === kindItem.kind }"
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
  --uno: "bg-$button-bg border-$button-border";
  --uno: "hover:bg-$button-hover active:bg-$button-active";
  --uno: "flex flex-row items-center justify-between";
  --uno: "text-default cursor-pointer";

  &.active {
    --uno: "bg-$button-default-1 border-$button-border-default";
  }
}
</style>
