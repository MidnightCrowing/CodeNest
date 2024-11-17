<script setup lang="ts">
import type { languagesGroupItem, ProjectLanguageInfo } from '~/constants/projectLanguage'
import { JeColorIcon } from '~/jetv-ui'

import InfoButton from './InfoButton.vue'
import { showPop } from './LanguagePop/LanguagePopProvider'

defineProps<{
  language: ProjectLanguageInfo
  languagesGroup: languagesGroupItem[]
}>()

const containerRef = ref<HTMLElement | null>(null)

function handleClick(languagesGroup: languagesGroupItem[]) {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()

    const top = rect.top + window.scrollY - 3
    const left = rect.left + window.scrollX - 5

    showPop(languagesGroup, top, left)
  }
}
</script>

<template>
  <div ref="containerRef" @click="handleClick(languagesGroup)">
    <InfoButton flex="~ items-center" gap="5px">
      <JeColorIcon type="circle" :custom-color="language.color" />
      {{ language.text }}
    </InfoButton>
  </div>
</template>
