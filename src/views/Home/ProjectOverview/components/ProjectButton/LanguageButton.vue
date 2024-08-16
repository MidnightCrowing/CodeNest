<script setup lang="ts">
import { Shape } from '~/components/LanguageCard/constants'
import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'
import { hidePop, showPop } from '~/components/LanguagePop/LanguagePopProvider'
import type { languagesGroupItem, ProjectLanguageInfo } from '~/constants/projectLanguage'

import InfoButton from './InfoButton.vue'

defineProps<{
  language: ProjectLanguageInfo
  languagesGroup: languagesGroupItem[]
}>()

function handleClick(event: MouseEvent, languagesGroup: languagesGroupItem) {
  const target = event.target as HTMLElement
  const rect = target.getBoundingClientRect()

  const top = rect.top + window.scrollY - 3
  const left = rect.left + window.scrollX - 5

  showPop(languagesGroup, top, left)
}
</script>

<template>
  <div
    relative
    @click="handleClick($event, languagesGroup)"
    @mouseleave="hidePop"
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <InfoButton>
      <LanguageCard
        :language-color="language.color"
        :shape="Shape.CIRCLE"
        m="r-5px"
      />
      {{ language.text }}
    </InfoButton>
  </div>
</template>
