<script setup lang="ts">
import { Shape } from '~/components/LanguageCard/constants'
import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'
import type { ProjectLanguage, ProjectLanguageInfo } from '~/constants/projectLanguage'

import type { ActivatedMenuItem } from '../types'

defineProps<{
  languageItem: ProjectLanguageInfo
}>()

const activatedMenuItem = inject<ActivatedMenuItem>('activatedItem')
const updateMenuLanguage = inject<(language: ProjectLanguage) => void>('updateActivatedItem', () => {})

function handleKindItemClick(language: ProjectLanguage) {
  updateMenuLanguage(`l-${language}`)
}
</script>

<template>
  <div
    class="language-item"
    :class="{ active: activatedMenuItem === `l-${languageItem.text}` }"
    @click="handleKindItemClick(languageItem.text)"
  >
    <span
      flex="~ row justify-start items-center"
      overflow-hidden
    >
      <span
        h="20px" min-w="16px" max-w="20px" m="x-8px"
        flex="~ justify-center items-center"
      >
        <LanguageCard :language-color="languageItem.color" :shape="Shape.VERTICAL_BAR" />
      </span>

      <span
        block truncate
        :title="languageItem.text"
      >
        {{ languageItem.text }}
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
  --uno: "bg-transparent";
  --uno: "hover:bg-theme-button-bgHoverTertiary active:bg-theme-button-bgActiveTertiary";
  --uno: "flex flex-row items-center justify-between";
  --uno: "cursor-pointer";

  &.active {
    --uno: "bg-theme-dropdown-bgSelected";
  }
}
</style>
