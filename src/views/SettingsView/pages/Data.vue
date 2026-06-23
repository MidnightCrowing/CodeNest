<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { showToast } from '~/components/ui/toast'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

import SettingsPage from '../components/SettingsPage.vue'
import SettingsRow from '../components/SettingsRow.vue'

const projectsStore = useProjectsStore()
const settings = useSettingsStore()
const { t } = useI18n()

type ProjectMutationResult = Awaited<ReturnType<typeof window.api.importProject>>

const webdavBusy = ref<'test' | 'upload' | 'pull' | null>(null)
const webdavStatus = ref<{ type: 'neutral' | 'info' | 'success' | 'warning' | 'error', text: string } | null>(null)

function clearWebDavStatus() {
  webdavStatus.value = null
}

function setWebDavStatus(success: boolean, text: string) {
  webdavStatus.value = {
    type: success ? 'success' : 'error',
    text,
  }
}

function formatWebDavError(error?: string) {
  const detail = error?.trim()
  if (!detail)
    return t('app.settings.data.webdav.failed')

  if (detail === 'WebDAV URL is required')
    return t('app.settings.data.webdav.errors.url_required')
  if (detail === 'Invalid WebDAV URL' || detail.includes('relative URL') || detail.includes('empty host'))
    return t('app.settings.data.webdav.errors.invalid_url')

  const connectionMatch = detail.match(/^WebDAV connection failed: (.+)$/)
  if (connectionMatch)
    return t('app.settings.data.webdav.errors.connection_failed', { detail: connectionMatch[1] })

  const uploadMatch = detail.match(/^Failed to upload (.+): (.+)$/)
  if (uploadMatch)
    return t('app.settings.data.webdav.errors.upload_failed', { file: uploadMatch[1], detail: uploadMatch[2] })

  const pullMatch = detail.match(/^Failed to pull (.+): (.+)$/)
  if (pullMatch)
    return t('app.settings.data.webdav.errors.download_failed', { file: pullMatch[1], detail: pullMatch[2] })

  const missingMatch = detail.match(/^Remote file not found: (.+)$/)
  if (missingMatch)
    return t('app.settings.data.webdav.errors.remote_file_missing', { file: missingMatch[1] })

  const createDirMatch = detail.match(/^Failed to create remote directory: (.+)$/)
  if (createDirMatch)
    return t('app.settings.data.webdav.errors.create_directory_failed', { detail: createDirMatch[1] })

  const checkDirMatch = detail.match(/^Failed to check remote directory: (.+)$/)
  if (checkDirMatch)
    return t('app.settings.data.webdav.errors.check_directory_failed', { detail: checkDirMatch[1] })

  return t('app.settings.data.webdav.errors.detail', { detail })
}

function isProjectMutationCancelled(result: ProjectMutationResult) {
  return !result.success && !result.error
}

function formatProjectMutationError(error: unknown) {
  if (typeof error === 'string')
    return error.replace(/^Error:\s*/i, '').trim()
  if (error instanceof Error)
    return error.message.replace(/^Error:\s*/i, '').trim()
  return String(error).replace(/^Error:\s*/i, '').trim()
}

async function importProjects() {
  try {
    const result = await window.api.importProject()
    if (result.success) {
      await projectsStore.loadProjects()
      showToast({
        tone: 'success',
        title: t('app.settings.data.projects.imported'),
      })
      return
    }

    if (isProjectMutationCancelled(result))
      return

    showToast({
      tone: 'error',
      title: t('app.settings.data.projects.import_failed'),
      description: formatProjectMutationError(result.error || result.message || t('app.common.unknown')),
    })
  }
  catch (error) {
    showToast({
      tone: 'error',
      title: t('app.settings.data.projects.import_failed'),
      description: formatProjectMutationError(error),
    })
  }
}

async function exportProjects() {
  try {
    const result = await window.api.exportProject()
    if (result.success) {
      showToast({
        tone: 'success',
        title: t('app.settings.data.projects.exported'),
      })
      return
    }

    if (isProjectMutationCancelled(result))
      return

    showToast({
      tone: 'error',
      title: t('app.settings.data.projects.export_failed'),
      description: formatProjectMutationError(result.error || result.message || t('app.common.unknown')),
    })
  }
  catch (error) {
    showToast({
      tone: 'error',
      title: t('app.settings.data.projects.export_failed'),
      description: formatProjectMutationError(error),
    })
  }
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
        : formatWebDavError(result.error),
    )
  }
  catch (error) {
    const message = formatWebDavError(String(error))
    setWebDavStatus(false, message)
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
        : formatWebDavError(result.error),
    )
  }
  catch (error) {
    const message = formatWebDavError(String(error))
    setWebDavStatus(false, message)
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
      const message = formatWebDavError(result.error)
      setWebDavStatus(false, message)
    }
  }
  catch (error) {
    const message = formatWebDavError(String(error))
    setWebDavStatus(false, message)
  }
  finally {
    webdavBusy.value = null
  }
}
</script>

<template>
  <SettingsPage :title="t('app.settings.data.title')">
    <SettingsRow
      :title="t('app.settings.data.projects.title')"
    >
      <div
        shrink-0 flex flex-wrap items-center justify-end
        gap-7px
      >
        <button class="ghost-button" type="button" @click="importProjects">
          <span class="i-custom:import" />
          {{ t('app.settings.data.projects.import') }}
        </button>
        <button class="ghost-button" type="button" @click="exportProjects">
          <span class="i-custom:export" />
          {{ t('app.settings.data.projects.export') }}
        </button>
      </div>
    </SettingsRow>

    <SettingsRow
      :title="t('app.settings.data.webdav.title')"
      align="start"
    >
      <div
        min-w-0 w-520px max-w-full flex flex-col
        gap-10px
      >
        <div grid gap-9px grid-cols="[repeat(2,minmax(0,1fr))]">
          <label min-w-0 flex flex-col gap-5px col-span-2>
            <span text-12px color="$ui-foreground" break-anywhere>{{ t('app.settings.data.webdav.server') }}</span>
            <input
              v-model="settings.webdav.endpoint"
              class="path-input"
              w-full
              spellcheck="false"
              :aria-label="t('app.settings.data.webdav.server')"
              :placeholder="t('app.settings.data.webdav.server_placeholder')"
            >
          </label>
          <label min-w-0 flex flex-col gap-5px col-span-2>
            <span text-12px color="$ui-foreground" break-anywhere>{{ t('app.settings.data.webdav.remote_path') }}</span>
            <input
              v-model="settings.webdav.remotePath"
              class="path-input"
              w-full
              spellcheck="false"
              :aria-label="t('app.settings.data.webdav.remote_path')"
              :placeholder="t('app.settings.data.webdav.remote_path_placeholder')"
            >
          </label>
          <label min-w-0 flex flex-col gap-5px>
            <span text-12px color="$ui-foreground" break-anywhere>{{ t('app.settings.data.webdav.account') }}</span>
            <input
              v-model="settings.webdav.username"
              class="path-input"
              w-full
              spellcheck="false"
              :aria-label="t('app.settings.data.webdav.account')"
              :placeholder="t('app.settings.data.webdav.account')"
            >
          </label>
          <label min-w-0 flex flex-col gap-5px>
            <span text-12px color="$ui-foreground" break-anywhere>{{ t('app.settings.data.webdav.password') }}</span>
            <input
              v-model="settings.webdav.password"
              class="path-input"
              w-full
              type="password"
              :aria-label="t('app.settings.data.webdav.password')"
              :placeholder="t('app.settings.data.webdav.password')"
            >
          </label>
        </div>
        <div flex flex-wrap items-center justify-end gap-7px>
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
            @click="uploadWebDavData"
          >
            <span class="i-lucide:cloud-upload" />
            {{ webdavBusy === 'upload' ? t('app.settings.data.webdav.uploading') : t('app.settings.data.webdav.upload') }}
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
        </div>
        <p
          class="status-message"
          m-0 min-h-16px text-right text-12px lh-16px
          :class="[webdavStatus?.type || 'neutral', { empty: !webdavStatus }]"
          :aria-hidden="!webdavStatus"
        >
          {{ webdavStatus?.text }}
        </p>
      </div>
    </SettingsRow>
  </SettingsPage>
</template>
