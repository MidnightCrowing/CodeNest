<script setup lang="ts">
import { ProjectKind } from '~/constants/projectKind'
import { JeLink } from '~/jetv-ui'

import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'
import type { ProjectItem } from './type'

const props = defineProps<{
  projectItem: ProjectItem
}>()
const { kind, from: kindFrom, url: kindUrl } = props.projectItem.kindInfo

const projectButton = ref<HTMLDivElement | null>(null)
const projectButtonActive = ref(false)

// eslint-disable-next-line unused-imports/no-unused-vars
function handleClick(path: string) {
  projectButtonActive.value = true
}

function handleClicked() {
  projectButtonActive.value = false
}

async function openLink(url: string | undefined) {
  if (url)
    await window.api.openExternal(url)
}
</script>

<template>
  <div
    ref="projectButton"
    hover:bg="dark:$gray-3"
    active:bg="dark:$gray-2"
    h="90px" p="10px" rounded="5px"
    flex="~ row"
    cursor-pointer overflow-hidden
    @mousedown="handleClick(projectItem.path)"
    @mouseup="handleClicked"
  >
    <div flex="~ col justify-between" w-full>
      <div flex="~ col" gap="5px">
        <span truncate>{{ projectItem.name }}</span>

        <span
          v-if="(kind === ProjectKind.FORK || kind === ProjectKind.CLONE) && (kindFrom || kindUrl)"
          truncate text-secondary
        >
          {{ kind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <JeLink
            v-if="kindUrl"
            type="web"
            :action="{ onClick: () => { openLink(kindUrl) } }"
          >
            {{ kindFrom || kindUrl }}
          </JeLink>
          <span v-else>{{ kindFrom }}</span>
        </span>

        <span truncate text-secondary>{{ projectItem.path }}</span>
      </div>

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
.je-link:not(.disabled) {
  @apply dark:color-$blue-6;
}
</style>
