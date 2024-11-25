<script lang="ts" setup>
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { JeLink } from '~/jetv-ui'
import { openLink } from '~/utils/main'

import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'

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
  langGroup: projectLangGroup,
  license: projectLicense,
} = toRefs(props.projectItem)

const projectCard = ref<HTMLDivElement | null>(null)
const projectCardActive = ref(false)

// eslint-disable-next-line unused-imports/no-unused-vars
function handleClick(path: string) {
  projectCardActive.value = true
}

function handleClicked() {
  projectCardActive.value = false
}
</script>

<template>
  <div
    ref="projectCard"
    class="project-card"
    :class="{ active: projectCardActive }"
    hover:bg="light:$gray-12 dark:$gray-3"
    h="90px" p="10px" rounded="5px"
    flex="~ row"
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
          :lang-group="projectLangGroup"
        />

        <LicenseButton
          v-if="projectLicense"
          :license="projectLicense"
        />
      </div>
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
