<script setup lang="ts">
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActivatedItem, Kind } from '../types'

const props = defineProps<{
  activatedKind: ActivatedItem
  updateKind: (kind: Kind) => void
}>()

const { t } = useI18n()

const kinds: { kind: Kind, i18nKey: string }[] = [
  { kind: 'all', i18nKey: t('kinds.all') },
  { kind: 'mine', i18nKey: t('kinds.mine') },
  { kind: 'fork', i18nKey: t('kinds.fork') },
  { kind: 'clone', i18nKey: t('kinds.clone') },
]

function handleKindItemClick(kindItem: Kind) {
  props.updateKind(kindItem)
}
</script>

<template>
  <div flex="~ col">
    <div
      v-for="kindItem in kinds"
      :key="kindItem.kind"
      class="kind-item"
      :class="{ active: activatedKind === kindItem.kind }"
      @click="() => handleKindItemClick(kindItem.kind)"
    >
      {{ kindItem.i18nKey }}
      <span class="num">
        4k
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.kind-item {
  --uno: "h-20px mx-8px px-20px py-6px rounded-4px";
  --uno: "bg-$button-bg border-$button-border";
  --uno: "hover:bg-$button-hover active:bg-$button-active";
  --uno: "flex flex-row items-center justify-between";
  --uno: "text-default cursor-pointer";

  & .num {
    --uno: "h-16px ml-8px px-8px rounded-16px";
    --uno: "bg-#afc8e14d";
    --uno: "text-12px font-600";
  }

  &.active {
    --uno: "bg-$button-default-1 border-$button-border-default";
  }
}
</style>
