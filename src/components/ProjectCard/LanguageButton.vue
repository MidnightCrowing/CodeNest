<script lang="ts" setup>
import type { languagesGroupItem, ProjectLanguage } from '~/constants/localProject'
import { JeColorIcon, JeTransparentButton } from '~/jetv-ui'

import { showPop } from './LanguagePop/LanguagePopProvider'

const props = defineProps<{
  mainLang: ProjectLanguage
  mainLangColor?: `#${string}`
  langGroup: languagesGroupItem[]
}>()

const containerRef = ref<HTMLElement | null>(null)
let languagesGroup = props.langGroup

// /**
//  * 获取 mainLang 对应的颜色
//  * @param mainLang - 当前的主语言
//  * @param langGroup - 语言组列表
//  * @returns {string} 颜色值，如果没有找到，则返回默认颜色
//  */
// function getMainLangColor(mainLang: ProjectLanguage, langGroup: languagesGroupItem[]): string {
//   const matchedLang = langGroup.find(lang => lang.text === mainLang)
//   return matchedLang ? matchedLang.color : '#fff'
// }

function handleClick() {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()

    const top = rect.top + window.scrollY - 3
    const left = rect.left + window.scrollX - 5

    showPop(languagesGroup, top, left)
  }
}

watch(() => props.langGroup, (newLangGroup, oldLangGroup) => {
  if (newLangGroup !== oldLangGroup) {
    languagesGroup = newLangGroup
  }
}, { deep: true }) // 使用 deep 监听 langGroup 的内部变化
</script>

<template>
  <div ref="containerRef" @click="handleClick">
    <JeTransparentButton
      class="lang-button"
      flex="~ items-center" gap="5px"
      @mousedown.stop @mouseup.stop
    >
      <JeColorIcon type="circle" :custom-color="mainLangColor" />
      {{ mainLang }}
    </JeTransparentButton>
  </div>
</template>

<style lang="scss" scoped>
.lang-button {
  @apply lh-16px;
  @apply px-10px py-5px;
}
</style>
