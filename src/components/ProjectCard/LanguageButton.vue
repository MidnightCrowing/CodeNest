<script lang="ts" setup>
import type { languagesGroupItem, ProjectLanguage } from '~/constants/localProject'
import { JeColorIcon } from '~/jetv-ui'

import InfoButton from './InfoButton.vue'
import { showPop } from './LanguagePop/LanguagePopProvider'

defineProps<{
  mainLang: ProjectLanguage
  langGroup: languagesGroupItem[]
}>()

const containerRef = ref<HTMLElement | null>(null)

/**
 * 获取 mainLang 对应的颜色
 * @param mainLang - 当前的主语言
 * @param langGroup - 语言组列表
 * @returns {string} 颜色值，如果没有找到，则返回默认颜色
 */
function getMainLangColor(mainLang: ProjectLanguage, langGroup: languagesGroupItem[]): string {
  const matchedLang = langGroup.find(lang => lang.text === mainLang)
  return matchedLang ? matchedLang.color : '#fff'
}

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
  <div ref="containerRef" @click="handleClick(langGroup)">
    <InfoButton flex="~ items-center" gap="5px">
      <JeColorIcon type="circle" :custom-color="getMainLangColor(mainLang, langGroup)" />
      {{ mainLang }}
    </InfoButton>
  </div>
</template>
