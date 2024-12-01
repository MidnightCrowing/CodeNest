<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'

import { JeColorIcon, JeLoader, JeTooltip } from '~/jetv-ui'

// noinspection ES6UnusedImports
import { languagesGroup, popupVisible, position } from './LanguagePopProvider'

const popupRef = ref<HTMLElement | null>(null)

onClickOutside(popupRef, () => {
  popupVisible.value = false
})
</script>

<template>
  <JeTooltip
    v-if="popupVisible"
    ref="popupRef"
    class="language-pop" state="info" direction="down"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
  >
    <template v-if="!languagesGroup">
      <div m="6px">
        <JeLoader />
      </div>
    </template>

    <template v-else>
      <div h="8px" m="t-5px b-10px">
        <span
          inline-block size-full
          rounded="8px" overflow-hidden
          flex="~ row" gap="0.6px"
        >
          <span
            v-for="languageItem in languagesGroup"
            :key="languageItem.text"
            :style="{ backgroundColor: languageItem.color ?? '#ccc', width: `${languageItem.percentage}%` }"
            :aria-label="`${languageItem.text} ${languageItem.percentage}%`"
          />
        </span>
      </div>

      <ul
        m="x-3px y-5px" p-0
        grid="~ cols-3" gap="x-15px y-8px"
        list-none
      >
        <li
          v-for="languageItem in languagesGroup"
          :key="languageItem.text"
          flex="~ items-center justify-between" gap="10px"
          text-medium
        >
          <div flex="~ items-center" gap="5px">
            <JeColorIcon
              class="color-icon"
              type="circle"
              :custom-color="languageItem.color ?? '#ccc'"
            />
            {{ languageItem.text }}
          </div>
          <span text="secondary">
            {{ languageItem.percentage }}%
          </span>
        </li>
      </ul>
    </template>
  </JeTooltip>
</template>

<style lang="scss" scoped>
.language-pop {
  @apply absolute translate-y--100%;
  @apply px-10px py-5px rounded-5px;
}

.color-icon {
  @apply size-0.6rem shrink-0;
}
</style>
