<script lang="ts" setup>
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { JeLink, JeTransparentToolButton } from '~/jetv-ui'
import { openLink } from '~/utils/main'

import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'
import OpenButton from './OpenButton.vue'

const props = defineProps<{
  projectItem: LocalProject
}>()
const {
  path: projectPath,
  name: projectName,
  kind: projectKind,
  fromUrl: projectFromUrl,
  fromName: projectFromName,
  mainLang: projectMainLang,
  mainLangColor: projectMainLangColor,
  langGroup: projectLangGroup,
  defaultOpen: projectDefaultOpen,
  license: projectLicense,
} = toRefs(props.projectItem)

const projectCard = ref<HTMLDivElement | null>(null)
const projectCardActive = ref(false)
const langGroup = ref(projectLangGroup)

// eslint-disable-next-line unused-imports/no-unused-vars
function handleClick(path: string) {
  projectCardActive.value = true
}

function handleClicked() {
  projectCardActive.value = false
}

watch(() => props.projectItem.langGroup, (newLangGroup, oldLangGroup) => {
  if (newLangGroup !== oldLangGroup) {
    langGroup.value = newLangGroup
  }
}, { deep: true }) // 使用 deep 监听 langGroup 的内部变化
</script>

<template>
  <div
    ref="projectCard"
    class="project-card group/item"
    :class="{ active: projectCardActive }"
    hover:bg="light:$gray-12 dark:$gray-3"
    p="10px" rounded="5px"
    flex="~ row justify-between"
    transition-all duration="150" ease-in-out
    cursor-pointer overflow-hidden
    @mousedown="handleClick(projectPath)"
    @mouseup="handleClicked"
  >
    <div flex="~ col justify-between" gap="8px">
      <!-- Info -->
      <div flex="~ col" gap="5px">
        <!-- Title -->
        <span truncate>{{ projectName }}</span>

        <!-- Link -->
        <span
          v-if="(projectKind === (ProjectKind.FORK || ProjectKind.CLONE)) && (projectFromUrl || projectFromName)"
          truncate text-secondary
        >
          {{ projectKind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <JeLink
            v-if="projectFromUrl"
            type="web"
            :on-click=" () => openLink(projectFromUrl) "
            @mousedown.stop @mouseup.stop
          >
            {{ projectFromName || projectFromUrl }}
          </JeLink>
          <span v-else>{{ projectFromName }}</span>
        </span>

        <!-- Path -->
        <span truncate text-secondary>{{ projectPath }}</span>
      </div>

      <!-- Button -->
      <div flex="~ row" gap="15px">
        <LanguageButton
          :main-lang="projectMainLang"
          :main-lang-color="projectMainLangColor"
          :lang-group="langGroup"
        />

        <LicenseButton
          v-if="projectLicense"
          :license="projectLicense"
        />
      </div>
    </div>

    <div flex="~ row items-center" gap="10px">
      <OpenButton
        class="group-hover/item:visible"
        :default-open="projectDefaultOpen"
        :project-path="projectPath"
        invisible
      />

      <JeTransparentToolButton
        p="3px"
        icon="light:i-jet:more-vertical dark:i-jet:more-vertical-dark"
        icon-size="17px"
        @mousedown.stop @mouseup.stop
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-card.active {
  @apply active:light:bg-$gray-13 active:dark:bg-$gray-2;
}

.je-link:not(.disabled) {
  @apply dark:color-$blue-6;
}
</style>
