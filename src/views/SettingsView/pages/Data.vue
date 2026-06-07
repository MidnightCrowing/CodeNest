<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

const projectsStore = useProjectsStore()
const settings = useSettingsStore()
const { t } = useI18n()

const webdavBusy = ref<'test' | 'upload' | 'pull' | null>(null)
const webdavStatus = ref<{ type: 'success' | 'error', text: string } | null>(null)

function clearWebDavStatus() {
  webdavStatus.value = null
}

function setWebDavStatus(success: boolean, text: string) {
  webdavStatus.value = {
    type: success ? 'success' : 'error',
    text,
  }
}

async function importProjects() {
  await window.api.importProject()
  await projectsStore.loadProjects()
}

function exportProjects() {
  void window.api.exportProject()
}

async function testWebDavConnection() {
  if (webdavBusy.value)
    return

  webdavBusy.value = 'test'
  clearWebDavStatus()
  await settings.saveSettings()
  try {
    const result = await window.api.webdavTestConnection(settings.webdav)
    setWebDavStatus(
      result.success,
      result.success
        ? t('app.settings.data.webdav.connected')
        : result.error || t('app.settings.data.webdav.failed'),
    )
  }
  catch (error) {
    setWebDavStatus(false, String(error))
  }
  finally {
    webdavBusy.value = null
  }
}

async function uploadWebDavData() {
  if (webdavBusy.value)
    return

  webdavBusy.value = 'upload'
  clearWebDavStatus()
  await settings.saveSettings()
  try {
    const result = await window.api.webdavUploadData(settings.webdav)
    setWebDavStatus(
      result.success,
      result.success
        ? t('app.settings.data.webdav.uploaded')
        : result.error || t('app.settings.data.webdav.failed'),
    )
  }
  catch (error) {
    setWebDavStatus(false, String(error))
  }
  finally {
    webdavBusy.value = null
  }
}

async function pullWebDavData() {
  if (webdavBusy.value)
    return

  webdavBusy.value = 'pull'
  clearWebDavStatus()
  await settings.saveSettings()
  try {
    const result = await window.api.webdavPullData(settings.webdav)
    if (result.success) {
      await Promise.all([
        settings.loadSettings(),
        projectsStore.loadProjects(),
      ])
      setWebDavStatus(true, t('app.settings.data.webdav.pulled_with_backup'))
    }
    else {
      setWebDavStatus(false, result.error || t('app.settings.data.webdav.failed'))
    }
  }
  catch (error) {
    setWebDavStatus(false, String(error))
  }
  finally {
    webdavBusy.value = null
  }
}
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h2>{{ t('app.settings.data.title') }}</h2>
    </header>

    <div class="settings-list">
      <div class="setting-row">
        <div class="setting-copy">
          <strong>{{ t('app.settings.data.projects.title') }}</strong>
          <span>{{ t('app.settings.data.projects.desc') }}</span>
        </div>
        <div class="row-actions">
          <button class="ghost-button" type="button" @click="importProjects">
            <span class="i-custom:import" />
            {{ t('app.settings.data.projects.import') }}
          </button>
          <button class="ghost-button" type="button" @click="exportProjects">
            <span class="i-custom:export" />
            {{ t('app.settings.data.projects.export') }}
          </button>
        </div>
      </div>

      <div class="setting-row webdav-row">
        <div class="setting-copy">
          <strong>{{ t('app.settings.data.webdav.title') }}</strong>
          <span>{{ t('app.settings.data.webdav.desc') }}</span>
        </div>
        <div class="webdav-panel">
          <div class="webdav-fields">
            <label class="field-control wide">
              <span>{{ t('app.settings.data.webdav.server') }}</span>
              <input
                v-model="settings.webdav.endpoint"
                class="path-input"
                spellcheck="false"
                :aria-label="t('app.settings.data.webdav.server')"
                :placeholder="t('app.settings.data.webdav.server_placeholder')"
              >
            </label>
            <label class="field-control wide">
              <span>{{ t('app.settings.data.webdav.remote_path') }}</span>
              <input
                v-model="settings.webdav.remotePath"
                class="path-input"
                spellcheck="false"
                :aria-label="t('app.settings.data.webdav.remote_path')"
                :placeholder="t('app.settings.data.webdav.remote_path_placeholder')"
              >
            </label>
            <label class="field-control">
              <span>{{ t('app.settings.data.webdav.account') }}</span>
              <input
                v-model="settings.webdav.username"
                class="path-input"
                spellcheck="false"
                :aria-label="t('app.settings.data.webdav.account')"
                :placeholder="t('app.settings.data.webdav.account')"
              >
            </label>
            <label class="field-control">
              <span>{{ t('app.settings.data.webdav.password') }}</span>
              <input
                v-model="settings.webdav.password"
                class="path-input"
                type="password"
                :aria-label="t('app.settings.data.webdav.password')"
                :placeholder="t('app.settings.data.webdav.password')"
              >
            </label>
          </div>
          <div class="webdav-actions">
            <button
              class="ghost-button"
              type="button"
              :disabled="webdavBusy !== null || !settings.webdav.endpoint"
              @click="testWebDavConnection"
            >
              <span class="i-lucide:plug-zap" />
              {{ webdavBusy === 'test' ? t('app.settings.data.webdav.testing') : t('app.settings.data.webdav.test') }}
            </button>
            <button
              class="ghost-button"
              type="button"
              :disabled="webdavBusy !== null || !settings.webdav.endpoint"
              @click="pullWebDavData"
            >
              <span class="i-lucide:cloud-download" />
              {{ webdavBusy === 'pull' ? t('app.settings.data.webdav.downloading') : t('app.settings.data.webdav.download') }}
            </button>
            <button
              class="ghost-button"
              type="button"
              :disabled="webdavBusy !== null || !settings.webdav.endpoint"
              @click="uploadWebDavData"
            >
              <span class="i-lucide:cloud-upload" />
              {{ webdavBusy === 'upload' ? t('app.settings.data.webdav.uploading') : t('app.settings.data.webdav.upload') }}
            </button>
          </div>
          <p
            v-if="webdavStatus"
            class="webdav-status"
            :class="webdavStatus.type"
          >
            {{ webdavStatus.text }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  @apply flex flex-col gap-10px;
}

.page-header {
  @apply flex items-end justify-between gap-10px;

  h2 {
    @apply m-0 text-16px font-650;
  }
}

.settings-list {
  @apply flex flex-col gap-8px;
}

.setting-row {
  @apply min-h-42px flex items-center justify-between gap-14px;
}

.webdav-row {
  @apply items-start;
}

.setting-copy {
  @apply min-w-0 flex flex-col gap-3px;

  strong {
    @apply text-13px font-620;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
  }
}

.row-actions {
  @apply shrink-0 flex items-center gap-7px;
}

.webdav-panel {
  @apply min-w-0 w-520px max-w-full flex flex-col gap-10px;
}

.webdav-fields {
  @apply grid gap-9px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-control {
  @apply min-w-0 flex flex-col gap-5px;

  span {
    @apply text-12px color-$ui-foreground;
  }
}

.field-control.wide {
  @apply col-span-2;
}

.path-input {
  @apply w-full;
}

.webdav-actions {
  @apply flex flex-wrap items-center justify-end gap-7px;
}

.webdav-status {
  @apply m-0 text-right text-12px;

  &.success {
    @apply color-$green-5;
  }

  &.error {
    @apply color-$red-5;
  }
}
</style>
