<script lang="ts" setup>
import { JeTransparentButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { useProjectsStore } from '~/stores/projectsStore'

import { version } from '../../../../package.json'

const { t } = useI18n()
const projects = useProjectsStore()

function openGithub() {
  window.api.openExternal('https://github.com/MidnightCrowing/CodeNest')
}

async function importProjects() {
  await window.api.importProject()
  await projects.loadProjects()
}

function exportProjects() {
  window.api.exportProject()
}
</script>

<template>
  <div
    flex="~ col" gap="8px"
    p="10px"
  >
    <h3 text="h2">
      {{ t('settings.about.title') }}
    </h3>

    <div p="y-5px" flex="~ items-center" gap="5px">
      <strong>{{ t('settings.about.version') }}: </strong>
      <span> v{{ version }}</span>
    </div>

    <div p="y-5px" flex="~ items-center" gap="5px">
      <strong>{{ t('settings.about.link') }}: </strong>
      <JeTransparentButton
        type="subtle"
        flex="~ items-center" gap="5px"
        @click="openGithub"
      >
        <span i-custom:github text="17px" />
        GitHub
      </JeTransparentButton>
    </div>

    <div p="y-5px" flex="~ items-center" gap="5px">
      <strong>{{ t('settings.about.import_export.title') }}: </strong>
      <div flex="~ items-center" gap="8px">
        <JeTransparentButton
          type="subtle"
          flex="~ items-center" gap="5px"
          @click="importProjects"
        >
          <span i-custom:import text="17px" />
          {{ t('settings.about.import_export.import_desc') }}
        </JeTransparentButton>
        <JeTransparentButton
          type="subtle"
          flex="~ items-center" gap="5px"
          @click="exportProjects"
        >
          <span i-custom:export text="17px" />
          {{ t('settings.about.import_export.export_desc') }}
        </JeTransparentButton>
      </div>
    </div>
  </div>
</template>
