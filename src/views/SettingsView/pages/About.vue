<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { version } from '../../../../package.json'
import SettingsPage from '../components/SettingsPage.vue'
import SettingsRow from '../components/SettingsRow.vue'

const { t } = useI18n()

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

const updateStatus = computed(() => {
  if (checking.value)
    return ''
  if (!updateInfo.value)
    return ''
  if (updateInfo.value.error)
    return formatUpdateError(updateInfo.value.error)
  if (updateInfo.value.hasUpdate)
    return t('app.settings.about.update.available', { version: updateInfo.value.latestVersion })
  return t('app.settings.about.update.latest')
})

const updateStatusTone = computed(() => {
  if (checking.value)
    return 'neutral'
  if (updateInfo.value?.error)
    return 'error'
  if (updateInfo.value?.hasUpdate)
    return 'warning'
  if (updateInfo.value)
    return 'success'
  return 'neutral'
})

function formatUpdateError(error: string) {
  const detail = error.trim()
  const requestMatch = detail.match(/^Request failed: (.+)$/)
  if (requestMatch)
    return t('app.settings.about.update.request_failed', { detail: requestMatch[1] })
  return t('app.settings.about.update.failed_detail', { detail })
}

function openGithub() {
  window.api.openExternal('https://github.com/MidnightCrowing/CodeNest')
}

function openRelease(url?: string) {
  window.api.openExternal(url || 'https://github.com/MidnightCrowing/CodeNest/releases/latest')
}

async function onCheckUpdate() {
  if (checking.value)
    return

  checking.value = true
  try {
    updateInfo.value = await window.api.checkUpdate()
  }
  catch (error) {
    updateInfo.value = { hasUpdate: false, currentVersion: version, error: String(error) }
  }
  finally {
    checking.value = false
  }
}
</script>

<template>
  <SettingsPage :title="t('app.settings.about.title')">
    <SettingsRow
      :title="`CodeNest v${version}`"
      :status="updateStatus"
      :status-tone="updateStatusTone"
      reserve-status
    >
      <div class="row-actions">
        <button class="ghost-button" type="button" :disabled="checking" @click="onCheckUpdate">
          {{ checking ? t('app.settings.about.update.checking') : t('app.settings.about.update.check') }}
        </button>
        <button
          v-if="updateInfo?.hasUpdate"
          class="primary-button"
          type="button"
          @click="openRelease(updateInfo.url)"
        >
          {{ t('app.settings.about.update.open_release') }}
        </button>
      </div>
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

<style lang="scss" scoped>
.row-actions {
  @apply shrink-0 flex items-center gap-7px;
}
</style>
