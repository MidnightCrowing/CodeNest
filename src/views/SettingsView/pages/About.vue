<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { version } from '../../../../package.json'

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
  <div class="settings-page">
    <header class="page-header">
      <h2>{{ t('app.settings.about.title') }}</h2>
    </header>

    <div class="settings-list">
      <div class="setting-row">
        <div class="setting-copy">
          <strong>CodeNest v{{ version }}</strong>
          <span v-if="!updateInfo">{{ t('app.settings.about.update.check_desc') }}</span>
          <span v-else-if="updateInfo.error" class="error-text">{{ updateInfo.error }}</span>
          <span v-else-if="updateInfo.hasUpdate">{{ t('app.settings.about.update.available', { version: updateInfo.latestVersion }) }}</span>
          <span v-else>{{ t('app.settings.about.update.latest') }}</span>
        </div>
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
      </div>

      <div class="setting-row">
        <div class="setting-copy">
          <strong>{{ t('app.settings.about.repository.title') }}</strong>
          <span>{{ t('app.settings.about.repository.desc') }}</span>
        </div>
        <button class="ghost-button" type="button" @click="openGithub">
          <span class="i-custom:github" />
          GitHub
        </button>
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

.setting-copy {
  @apply min-w-0 flex flex-col gap-3px;

  strong {
    @apply text-13px font-620;
  }

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
  }
}

.error-text {
  @apply color-$red-5;
}

.row-actions {
  @apply shrink-0 flex items-center gap-7px;
}

.primary-button,
.ghost-button {
  @apply h-28px border-0 rounded-5px px-9px;
  @apply inline-flex items-center gap-5px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.primary-button {
  @apply bg-$ui-primary color-$ui-primary-foreground;
  @apply hover:bg-$ui-primary-hover active:bg-$ui-primary-active;
}

.ghost-button {
  @apply bg-$ui-surface-background color-$ui-foreground;
  @apply hover:bg-$ui-hover-background;

  &:disabled {
    @apply opacity-55 cursor-not-allowed;
  }
}
</style>
