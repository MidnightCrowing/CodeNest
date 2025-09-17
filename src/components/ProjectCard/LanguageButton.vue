<script lang="ts" setup>
import { JeColorIcon, JeTransparentButton } from 'jetv-ui'

import type { LocalProject } from '~/constants/localProject'

import { showPop } from './LanguagePop/LanguagePopProvider'

const props = defineProps<{
  projectItem: LocalProject
}>()

const containerRef = ref<HTMLElement | null>(null)

function handleClick() {
  if (containerRef.value && props.projectItem.isExists) {
    const rect = containerRef.value.getBoundingClientRect()

    const top = rect.top + window.scrollY - 3
    const left = rect.left + window.scrollX - 5

    showPop(props.projectItem, top, left)
  }
}
</script>

<template>
  <div ref="containerRef" @click="handleClick">
    <JeTransparentButton
      class="lang-button"
      flex="~ items-center" gap="5px"
    >
      <JeColorIcon type="circle" :custom-color="projectItem.mainLangColor ?? '#ccc'" />
      {{ projectItem.mainLang }}
    </JeTransparentButton>
  </div>
</template>

<style lang="scss" scoped>
.lang-button {
  @apply lh-16px;
  @apply px-10px py-5px;
}
</style>
