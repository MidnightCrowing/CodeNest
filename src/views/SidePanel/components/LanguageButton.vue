<script setup lang="ts">
import { Shape } from '~/components/LanguageCard/constants'
import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'
import type { ProjectLanguage, ProjectLanguageInfo } from '~/constants/types'

import type { ActivatedItem } from '../types'

defineProps<{
  languageItem: ProjectLanguageInfo
}>()

const activatedItem = inject<ActivatedItem>('activatedItem')
const updateLanguage = inject<(language: ProjectLanguage) => void>('updateActivatedItem', () => {})

function handleKindItemClick(language: ProjectLanguage) {
  updateLanguage(`l-${language}`)
}
</script>

<template>
  <div
    class="language-item"
    :class="{ active: activatedItem === `l-${languageItem.language}` }"
    @click="handleKindItemClick(languageItem.language)"
  >
    <span
      flex="~ row justify-start items-center"
      overflow="hidden"
    >
      <span
        h="20px" w="min-w-16px max-w-20px" m="x-8px"
        flex="~ justify-center items-center"
      >
        <LanguageCard :language-color="languageItem.color" :shape="Shape.VERTICAL_BAR" />
      </span>

      <span
        block overflow="hidden" text-ellipsis whitespace-nowrap
        :title="languageItem.language"
      >
        {{ languageItem.language }}
      </span>
    </span>

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
.language-item {
  --uno: "h-20px mx-8px pl-2px pr-20px py-6px rounded-4px";
  --uno: "bg-$button-bg-1";
  --uno: "hover:bg-$hover-1 active:bg-$active-1";
  --uno: "flex flex-row items-center justify-between";
  --uno: "cursor-pointer";

  &.active {
    --uno: "bg-$select-3";
  }
}
</style>
