<script setup lang="ts">
import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'
import type { ProjectLanguageInfo } from '~/constants/types'

import type { languagesGroupItem } from '../../types'
import InfoButton from './InfoButton.vue'

defineProps<{
  language: ProjectLanguageInfo
  languagesGroup: languagesGroupItem[]
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
function languageButtonHover(languagesGroup: languagesGroupItem[]) {
}

function languageButtonHovered() {
}
</script>

<template v-if="language">
  <InfoButton
    @mouseenter="languageButtonHover(languagesGroup)"
    @mouseleave="languageButtonHovered"
  >
    <LanguageCard
      :language-color="language.color"
      m="r-5px"
    />
    {{ language.text }}
  </InfoButton>
</template>
