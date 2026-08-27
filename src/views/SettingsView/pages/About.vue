<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { useAppUpdateStore } from '~/stores/appUpdateStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

import { version } from '../../../../package.json'
import SettingsPage from '../components/SettingsPage.vue'
import SettingsRow from '../components/SettingsRow.vue'

const { t } = useI18n()
const updateStore = useAppUpdateStore()
const projectsStore = useProjectsStore()
const settingsStore = useSettingsStore()

const updateStatus = computed(() => {
  if (updateStore.checking)
    return ''
  if (updateStore.status === 'downloading') {
    return updateStore.downloadProgress === null
      ? t('app.settings.about.update.downloading')
      : t('app.settings.about.update.downloading_progress', { progress: updateStore.downloadProgress })
  }
  if (updateStore.status === 'installing')
    return t('app.settings.about.update.installing')
  if (updateStore.error)
    return t('app.settings.about.update.failed_detail', { detail: updateStore.error })
  if (updateStore.updateInfo?.hasUpdate)
    return t('app.settings.about.update.available', { version: updateStore.updateInfo.latestVersion })
  if (updateStore.status === 'latest')
    return t('app.settings.about.update.latest')
  return ''
})

const updateStatusTone = computed(() => {
  if (updateStore.checking || updateStore.installing)
    return 'neutral'
  if (updateStore.error)
    return 'error'
  if (updateStore.updateInfo?.hasUpdate)
    return 'warning'
  if (updateStore.status === 'latest')
    return 'success'
  return 'neutral'
})

function openGithub() {
  window.api.openExternal('https://github.com/MidnightCrowing/CodeNest')
}

async function onCheckUpdate() {
  await updateStore.checkUpdate()
}

async function onInstallUpdate() {
  await settingsStore.saveSettings()
  await projectsStore.saveProjects()
  await updateStore.installUpdate()
}
</script>

<template>
  <SettingsPage :title="t('app.settings.about.title')">
    <SettingsRow
      :title="`CodeNest v${version}`"
      :status="updateStatus"
      :status-tone="updateStatusTone"
      reserve-status
      selectable-title
    >
      <div shrink-0 flex items-center gap-7px>
        <button class="ghost-button" type="button" :disabled="updateStore.checking || updateStore.installing" @click="onCheckUpdate">
          {{ updateStore.checking ? t('app.settings.about.update.checking') : t('app.settings.about.update.check') }}
        </button>
        <button
          v-if="updateStore.updateInfo?.hasUpdate"
          class="primary-button"
          type="button"
          :disabled="updateStore.installing"
          @click="onInstallUpdate"
        >
          {{ updateStore.status === 'downloading'
            ? t('app.settings.about.update.downloading')
            : updateStore.status === 'installing'
              ? t('app.settings.about.update.installing')
              : t('app.settings.about.update.install') }}
        </button>
      </div>
      <template #status>
        <span class="select-text">{{ updateStatus }}</span>
      </template>
    </SettingsRow>

    <SettingsRow
      :title="t('app.settings.about.repository.title')"
    >
      <button class="ghost-button" type="button" @click="openGithub">
        <span class="i-custom:github" />
        GitHub
      </button>
    </SettingsRow>
  </SettingsPage>
</template>
