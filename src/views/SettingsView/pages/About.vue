<script lang="ts" setup>
import { JeLink, JeLoader, JeTransparentButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { useProjectsStore } from '~/stores/projectsStore'

import { version } from '../../../../package.json'

const { t } = useI18n()
const projectsStore = useProjectsStore()

const checking = ref(false)
const updateInfo = ref<{
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  url?: string
  name?: string
  notes?: string
  publishedAt?: string
  error?: string
} | null>(null)

function openGithub() {
  window.api.openExternal('https://github.com/MidnightCrowing/CodeNest')
}

function openRelease(url?: string) {
  const target = url || 'https://github.com/MidnightCrowing/CodeNest/releases/latest'
  window.api.openExternal(target)
}

async function onCheckUpdate() {
  if (checking.value)
    return
  checking.value = true
  try {
    const res = await window.api.checkUpdate()
    updateInfo.value = res
  }
  catch (e) {
    updateInfo.value = { hasUpdate: false, currentVersion: version, error: String(e) }
  }
  finally {
    checking.value = false
  }
}

async function importProjects() {
  await window.api.importProject()
  await projectsStore.loadProjects()
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

    <div p="y-5px" flex="~ row" gap="5px">
      <strong>{{ t('settings.about.version.title') }}: </strong>

      <div flex="~ col" gap="5px">
        <span> v{{ version }}</span>

        <div flex="~ row items-center" gap="8px">
          <JeLink
            type="internal"
            :disabled="checking"
            @click="onCheckUpdate"
          >
            {{ t('settings.about.version.check_update') }}
          </JeLink>

          <template v-if="checking">
            <div flex="~ row items-center" gap="2px">
              <JeLoader />
              <span text="secondary">{{ t('settings.about.version.checking_update') }}</span>
            </div>
          </template>

          <template v-else-if="updateInfo && !updateInfo.hasUpdate && !updateInfo.error">
            <span text="secondary">{{ t('settings.about.version.is_latest') }}</span>
          </template>

          <template v-else-if="updateInfo && updateInfo.hasUpdate">
            <JeLink type="internal" @click="openRelease(updateInfo.url)">
              {{ t('settings.about.version.found_new') }}
              <span v-if="updateInfo.latestVersion">: v{{ updateInfo.latestVersion }}</span>
            </JeLink>
          </template>

          <template v-else-if="updateInfo && updateInfo.error">
            <span text="light:$red-5 dark:$red-5">{{ updateInfo.error }}</span>
          </template>
        </div>
      </div>
    </div>

    <div p="y-5px" flex="~ items-center" gap="5px">
      <strong>{{ t('settings.about.link') }}: </strong>
      <JeTransparentButton
        type="subtle"
        flex="~ items-center" gap="5px"
        @click="openGithub"
      >
        <span class="i-custom:github" text="17px" />
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
          <span class="i-custom:import" text="17px" />
          {{ t('settings.about.import_export.import_desc') }}
        </JeTransparentButton>
        <JeTransparentButton
          type="subtle"
          flex="~ items-center" gap="5px"
          @click="exportProjects"
        >
          <span class="i-custom:export" text="17px" />
          {{ t('settings.about.import_export.export_desc') }}
        </JeTransparentButton>
      </div>
    </div>
  </div>
</template>
