<script lang="ts" setup>
import { JeCard, JeDropdown } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { LanguageEnum, ThemeEnum } from '~/constants/appEnums'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme } from '~/utils/theme'

const settings = useSettingsStore()
const { locale } = useI18n()
const { t } = useI18n()

const appTheme = ref<ThemeEnum>(settings.theme)
const appLanguage = ref<LanguageEnum>(settings.language)

function setTheme(theme: ThemeEnum) {
  settings.theme = theme
  applyTheme(theme)
  settings.saveSettings()
}

function setLanguage(lang: LanguageEnum) {
  settings.language = lang
  locale.value = lang
  settings.saveSettings()
}
</script>

<template>
  <div
    flex="~ col" gap="8px"
    p="10px"
  >
    <h3 text="h2">
      {{ t('settings.appearance.title') }}
    </h3>

    <!-- 程序主题 -->
    <JeCard p="15px" flex="~ items-center justify-between">
      {{ t('settings.appearance.app_theme.title') }}
      <JeDropdown
        v-model="appTheme"
        :options="[
          { value: ThemeEnum.Light, label: t('settings.appearance.app_theme.light') },
          { value: ThemeEnum.Dark, label: t('settings.appearance.app_theme.dark') },
        ]"
        w-150px
        @update:model-value="setTheme"
      />
    </JeCard>

    <!-- 程序语言 -->
    <JeCard p="15px" flex="~ items-center justify-between">
      {{ t('settings.appearance.app_language') }}
      <JeDropdown
        v-model="appLanguage"
        :options="[
          { value: LanguageEnum.English, label: 'English' },
          { value: LanguageEnum.zh_CN, label: '简体中文' },
        ]"
        w-150px
        @update:model-value="setLanguage"
      />
    </JeCard>
  </div>
</template>
