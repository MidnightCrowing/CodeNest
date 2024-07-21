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
    @mousedown="projectButtonClick(projectItem.path)"
    @mouseup="projectButtonClicked()"
  >
    <div flex="~ col justify-between" max-w="100%" text-small>
      <div flex="~ col" gap="5px">
        <span class="text title">{{ projectItem.name }}</span>

        <span
          v-if="(kind === ProjectKind.FORK || kind === ProjectKind.CLONE) && (kindFrom || kindUrl)"
          class="text info kind"
        >
          {{ kind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <template v-if="kindFrom && kindUrl">
            <a :href="kindUrl" target="_blank">{{ kindFrom }}</a>
          </template>
          <template v-else-if="kindUrl">
            <a :href="kindUrl" target="_blank">{{ kindUrl }}</a>
          </template>
          <template v-else>
            <span>{{ kindFrom }}</span>
          </template>
        </span>

        <span class="text info">{{ projectItem.path }}</span>
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
  --uno: "h-90px rounded-5px p-10px";
  --uno: "flex flex-row";
  --uno: "hover:bg-$hover-1";
  --uno: "cursor-pointer";

  &.active {
    --uno: "active:bg-$active-1";
  }
}

.text {
  --uno: "whitespace-nowrap text-ellipsis overflow-hidden";
}

.title {
  --uno: "text-default m-b-2px";
}

.info {
  --uno: "text-$text-color-3";
}

.kind {
  --uno: "text-$text-color-3";

  & a {
    --uno: "text-$text-color-3 hover:text-$text-hover";
  }
}
</style>
