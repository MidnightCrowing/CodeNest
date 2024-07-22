<script setup lang="ts">
import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'

import { languagesGroup, position, visible as visibleSign } from './LanguagePopProvider'

const popElementRef = ref<HTMLElement | null>(null)
const popVisible = ref(false)

function percentConversion(num: number) {
  return `${(num * 100).toFixed(2)}%`
}

function handleMouseEnter() {
  popVisible.value = true
}

function handleMouseLeave() {
  setTimeout(() => {
    if (!popElementRef.value?.matches(':hover')) {
      popVisible.value = false
    }
  }, 100)
}

watch(visibleSign, (newVal: boolean) => {
  if (!newVal) {
    setTimeout(() => {
      if (!popElementRef.value?.matches(':hover')) {
        popVisible.value = false
      }
    }, 100)
  }
  else {
    popVisible.value = true
  }
})
</script>

<template>
  <div
    v-if="popVisible"
    ref="popElementRef"
    class="languagePop"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div h="8px" m="t-5px b-10px">
      <span
        inline-block w-full h-full
        rounded="8px" overflow-hidden
        flex="~ row" gap="1px"
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
      grid gap="8px" grid-cols="3"
      list-none
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
.languagePop {
  --uno: "absolute";
  --uno: "translate-y--100%";
  --uno: "bg-$bg-1 shadow-$shadow-1";
  --uno: "px-10px py-5px rounded-5px";
  --uno: "cursor-default";
}
</style>
