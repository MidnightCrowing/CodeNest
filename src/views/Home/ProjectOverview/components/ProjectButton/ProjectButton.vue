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

// eslint-disable-next-line unused-imports/no-unused-vars
function projectButtonClick(path: string) {
  if (projectButton.value) {
    projectButton.value.classList.add('active')
  }
}

function projectButtonClicked() {
  if (projectButton.value) {
    projectButton.value.classList.remove('active')
  }
}
</script>

<template>
  <div
    ref="projectButton"
    class="project-button"
    bg="hover:$hover-1"
    h="90px"
    rounded="5px"
    p="10px"
    flex="~ row"
    cursor-pointer
    overflow-hidden
    @mousedown="projectButtonClick(projectItem.path)"
    @mouseup="projectButtonClicked()"
  >
    <div flex="~ col justify-between" w="100%" text-small>
      <div flex="~ col" gap="5px">
        <span truncate text-default m-b-2px>{{ projectItem.name }}</span>

        <span
          v-if="(kind === ProjectKind.FORK || kind === ProjectKind.CLONE) && (kindFrom || kindUrl)"
          class="project-kind"
        >
          {{ kind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <template v-if="kindFrom && kindUrl">
            <a :href="kindUrl" target="_blank">{{ kindFrom }}<span /></a>
          </template>
          <template v-else-if="kindUrl">
            <a :href="kindUrl" target="_blank">{{ kindUrl }}<span /></a>
          </template>
          <template v-else>
            <span>{{ kindFrom }}</span>
          </template>
        </span>

        <span truncate text-comment>{{ projectItem.path }}</span>
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
.project-button {
  &.active {
    --uno: "active:bg-$active-1";
  }

  .project-kind {
    --uno: "truncate text-comment";

    a {
      --uno: "text-comment text-link";

      span {
        --uno: "i-static-external-link-arrow?mask";
        --uno: "size-13px";
      }
    }
  }
}
</style>
