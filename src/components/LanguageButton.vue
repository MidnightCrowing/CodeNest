<script setup lang="ts">
import type { ActivatedItem, Language, LanguageItem } from '../types'

defineProps<{
  languageItem: LanguageItem
}>()

const activatedItem = inject<ActivatedItem>('activatedItem')
const updateLanguage = inject<(language: Language) => void>('updateActivatedItem', () => {})

function handleKindItemClick(language: Language) {
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
        h="20px" w="min-w-16px max-w-20px"
        m="x-8px"
        flex="~ justify-center items-center"
      >
        <div
          h="10px" w="10px"
          border="solid 1px #ffffff26" rounded="8px"
          :style="{ backgroundColor: languageItem.color }"
        />
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
  --uno: "text-default cursor-pointer";

  &.active {
    --uno: "bg-$select-3";
  }
}
</style>
