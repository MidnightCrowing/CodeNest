<script setup lang="ts">
import { ref } from 'vue'

import LanguageCard from '~/components/LanguageCard/LanguageCard.vue'
import type { ProjectLanguageInfo } from '~/constants/types'

import type { languagesGroupItem } from '../../types'
import InfoButton from './InfoButton.vue'
import LanguagePop from './LanguagePop.vue'

defineProps<{
  language: ProjectLanguageInfo
  languagesGroup: languagesGroupItem[]
}>()

const showPopComponent = ref(false)

function showPop() {
  showPopComponent.value = true
}

function hidePop() {
  showPopComponent.value = false
}
</script>

<template>
  <div
    relative
  >
    <template v-if="showPopComponent">
      <LanguagePop
        :languages-group="languagesGroup"
        left="-5px" top="-2px"
      />
    </template>

    <InfoButton
      @mouseenter="showPop"
      @mouseleave="hidePop"
    >
      <LanguageCard
        :language-color="language.color"
        m="r-5px"
      />
      {{ language.text }}
    </InfoButton>
  </div>
</template>
