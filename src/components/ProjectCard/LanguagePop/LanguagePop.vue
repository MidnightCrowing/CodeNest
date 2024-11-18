<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

import { JeColorIcon, JeTooltip } from '~/jetv-ui'

import { languagesGroup, popupVisible, position } from './LanguagePopProvider'

const popupRef = ref<HTMLElement | null>(null)

function percentConversion(num: number) {
  return `${(num * 100).toFixed(2)}%`
}

onClickOutside(popupRef, () => {
  popupVisible.value = false
})
</script>

<template>
  <JeTooltip
    v-if="popupVisible && languagesGroup"
    ref="popupRef"
    class="languagePop" state="info" direction="down"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
  >
    <div h="8px" m="t-5px b-10px">
      <span
        inline-block size-full
        rounded="8px" overflow-hidden
        flex="~ row" gap="1px"
      >
        <span
          v-for="languageItem in languagesGroup"
          :key="languageItem.text"
          :style="{ backgroundColor: languageItem.color, width: percentConversion(languageItem.percentage) }"
          :aria-label="`${languageItem.text} ${percentConversion(languageItem.percentage)}`"
        />
      </span>
    </div>

    <ul
      m="x-3px y-5px" p-0
      grid="~ cols-2" gap="x-15px y-8px"
      list-none
    >
      <li
        v-for="languageItem in languagesGroup"
        :key="languageItem.text"
        flex="~ items-center justify-between" gap="10px"
      >
        <div flex="~ items-center" gap="8px">
          <JeColorIcon
            type="vertical-bar"
            :custom-color="languageItem.color"
          />
          {{ languageItem.text }}
        </div>
        <span text="secondary">
          {{ percentConversion(languageItem.percentage) }}
        </span>
      </li>
    </ul>
  </JeTooltip>
</template>

<style scoped lang="scss">
.languagePop {
  @apply absolute translate-y--100%;
  @apply px-10px py-5px rounded-5px;
}
</style>
