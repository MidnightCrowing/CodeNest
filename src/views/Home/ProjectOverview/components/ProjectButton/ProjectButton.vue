<script setup lang="ts">
import { ProjectKind } from '~/constants/projectKind'

import type { ProjectItem } from '../../types'
import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'

const props = defineProps<{
  projectItem: ProjectItem
}>()
const { kind, from: kindFrom, url: kindUrl } = props.projectItem.kindInfo

const projectButton = ref<HTMLDivElement | null>(null)
const projectButtonActive = ref(false)

// eslint-disable-next-line unused-imports/no-unused-vars
function projectButtonClick(path: string) {
  projectButtonActive.value = true
}

function projectButtonClicked() {
  projectButtonActive.value = false
}
</script>

<template>
  <div
    ref="projectButton"
    bg="hover:theme-button-bgHoverTertiary active:theme-button-bgActiveTertiary"
    h="90px" p="10px" rounded="5px"
    flex="~ row"
    cursor-pointer
    overflow-hidden
    @mousedown="projectButtonClick(projectItem.path)"
    @mouseup="projectButtonClicked()"
  >
    <div flex="~ col justify-between" w="100%" text-small>
      <div flex="~ col" gap="5px">
        <span w-fit m="b-2px" truncate>{{ projectItem.name }}</span>

        <span
          v-if="(kind === ProjectKind.FORK || kind === ProjectKind.CLONE) && (kindFrom || kindUrl)"
          class="project-kind"
          w-fit truncate text-comment
          @mousedown.stop
          @mouseup.stop
        >
          {{ kind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <a v-if="kindUrl" :href="kindUrl" target="_blank">
            {{ kindFrom || kindUrl }}
            <span
              relative top="-1px" left="-5px"
              i-static="external-link-arrow?mask" size="13px"
            />
          </a>
          <span v-else>{{ kindFrom }}</span>
        </span>

        <span w-fit truncate text-comment>{{ projectItem.path }}</span>
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
.project-kind a {
  @apply text-link text-comment;
}
</style>
