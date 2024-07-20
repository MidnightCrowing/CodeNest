<script setup lang="ts">
import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'

import type { languagesGroupItem } from '../../types'

defineProps<{
  languagesGroup: languagesGroupItem[]
}>()

function percentConversion(num: number) {
  return `${(num * 100).toFixed(2)}%`
}
</script>

<template>
  <div
    absolute translate-y="-100%"
    bg="$bg-1" shadow="shadow-1"
    p="x-10px y-5px" rounded="5px"
  >
    <div h="8px" m="t-5px b-10px">
      <span
        inline-block w-full h-full
        rounded="8px" overflow-hidden
        flex row gap="1px"
      >
        <span
          v-for="languageItem in languagesGroup"
          :key="languageItem.text"
          :style="`background-color:${languageItem.color}; width: ${percentConversion(languageItem.percentage)};`"
          :aria-label="`${languageItem.text} ${percentConversion(languageItem.percentage)}`"
        />
      </span>
    </div>

    <ul
      m="x-3px y-5px" p-0
      grid gap="8px"
    >
      <li
        v-for="languageItem in languagesGroup"
        :key="languageItem.text"
        flex="~ items-center"
      >
        <LanguageCard
          :language-color="languageItem.color"
          m="r-2" h="6px" w="6px"
        />
        <span mr="5px">
          {{ languageItem.text }}
        </span>
        <span ml-auto text="$text-color-3">
          {{ percentConversion(languageItem.percentage) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
ul {
  grid-template-columns: 1fr 1fr;
}
</style>
