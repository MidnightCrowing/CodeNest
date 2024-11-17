<script setup lang="ts">
import { ProjectKind } from '~/constants/projectKind'
import { JeLink } from '~/jetv-ui'
import { openLink } from '~/utils/main'

import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'
import type { ProjectItem } from './type'

const props = defineProps<{
  projectItem: ProjectItem
}>()
const { kind, from: kindFrom, url: kindUrl } = props.projectItem.kindInfo

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
    @mousedown="handleClick(projectItem.path)"
    @mouseup="handleClicked"
  >
    <div flex="~ col justify-between" gap="8px">
      <!-- Info -->
      <div flex="~ col" gap="5px">
        <!-- Title -->
        <span truncate>{{ projectItem.name }}</span>

        <!-- Link -->
        <span
          v-if="(kind === ProjectKind.FORK || kind === ProjectKind.CLONE) && (kindFrom || kindUrl)"
          truncate text-secondary
        >
          {{ kind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <JeLink
            v-if="kindUrl"
            type="web"
            :action="{ onClick: () => { openLink(kindUrl) } }"
            @mousedown.stop @mouseup.stop
          >
            {{ kindFrom || kindUrl }}
          </JeLink>
          <span v-else>{{ kindFrom }}</span>
        </span>

        <!-- Path -->
        <span truncate text-secondary>{{ projectItem.path }}</span>
      </div>

      <!-- Button -->
      <div flex="~ row" gap="15px">
        <LanguageButton
          :language="projectItem.language"
          :languages-group="projectItem.languagesGroup"
        />

        <LicenseButton
          :license="projectItem.license"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-card.active {
  @apply active:light:bg-$gray-13 active:dark:bg-$gray-2;
}

.je-link:not(.disabled) {
  @apply dark:color-$blue-6;
}
</style>
