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
    @click="showPop"
    @mouseleave="hidePop"
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <template v-if="showPopComponent">
      <LanguagePop
        :languages-group="languagesGroup"
        left="-5px"
      />
    </template>

    <InfoButton>
      <LanguageCard
        :language-color="language.color"
        m="r-5px"
      />
      {{ language.text }}
    </InfoButton>
  </div>
</template>
