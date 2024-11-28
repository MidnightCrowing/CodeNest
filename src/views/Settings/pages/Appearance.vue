<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { LanguageType, ThemeEnum } from '~/constants/appEnums'
import { settings } from '~/core/settings'
import { JeCard, JeDropdown } from '~/jetv-ui'
import { currentTheme } from '~/utils/theme'

const { locale } = useI18n()
const { t } = useI18n()

const appLanguage = ref(locale.value)

function setLanguage(lang: string) {
  locale.value = lang
}

watch(currentTheme, (newTheme) => {
  settings.updateSetting('theme', newTheme)
  // settings.saveSettings()
})

watch(appLanguage, (newLang) => {
  setLanguage(newLang)
  settings.updateSetting('language', newLang)
  // settings.saveSettings()
})
</script>

<template>
  <div
    flex="~ col" gap="8px"
    p="10px"
  >
    <h3>{{ t('settings.appearance.title') }}</h3>

    <!-- 程序主题 -->
    <JeCard p="15px" flex="~ items-center justify-between">
      {{ t('settings.appearance.app_theme.title') }}
      <JeDropdown
        v-model="currentTheme"
        :options="[
          { value: ThemeEnum.Light, label: t('settings.appearance.app_theme.light') },
          { value: ThemeEnum.Dark, label: t('settings.appearance.app_theme.dark') },
        ]"
        w-150px
      />
    </JeCard>

    <!-- 程序语言 -->
    <JeCard p="15px" flex="~ items-center justify-between">
      {{ t('settings.appearance.app_language') }}
      <JeDropdown
        v-model="appLanguage"
        :options="[
          { value: LanguageType.English, label: 'English' },
          { value: LanguageType.zh_CN, label: '简体中文' },
        ]"
        w-150px
      />
    </JeCard>
  </div>
</template>

<style lang="scss" scoped>

</style>
