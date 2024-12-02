<script lang="ts" setup>
import { JeTransparentButton } from '@jetv/ui'
import { useI18n } from 'vue-i18n'

import { projectManager } from '~/core/main'

import { version } from '../../../../package.json'

const { t } = useI18n()

function openGithub() {
  window.api.openExternal('https://github.com/MidnightCrowing/CodeNest')
}

async function importProjects() {
  await window.api.importData()
  await projectManager.loadProjects()
}

function exportProjects() {
  window.api.exportData()
}
</script>

<template>
  <div
    flex="~ col" gap="8px"
    p="10px"
  >
    <h3>{{ t('settings.about.title') }}</h3>

    <div p="y-5px" flex="~ items-center" gap="5px">
      <strong>{{ t('settings.about.version') }}: </strong>
      <span> v{{ version }}</span>
    </div>

    <div p="y-5px" flex="~ items-center" gap="5px">
      <strong>{{ t('settings.about.link') }}: </strong>
      <JeTransparentButton
        class="trans-button"
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
          class="trans-button"
          flex="~ items-center" gap="5px"
          @click="importProjects"
        >
          <span i-custom:import text="17px" />
          {{ t('settings.about.import_export.import_desc') }}
        </JeTransparentButton>
        <JeTransparentButton
          class="trans-button"
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

<style lang="scss" scoped>
.trans-button {
  @apply rounded-6px;
  @apply transition-all duration-400 transform-gpu;
  @apply cursor-pointer;

  @apply light:bg-$gray-12 light:hover:bg-$gray-10;
  @apply dark:bg-$gray-3 dark:hover:bg-$gray-5;

  &:active {
    @apply transform duration-200 scale-95;
  }
}
</style>
