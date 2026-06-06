<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiSelect from '~/components/ui/UiSelect.vue'
import { LanguageEnum, ThemeColorEnum, ThemeEnum } from '~/constants/appEnums'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme } from '~/utils/theme'

const settings = useSettingsStore()
const { locale, t } = useI18n()

const themeOptions = computed(() => [
  { value: ThemeEnum.Light, label: t('app.settings.appearance.theme.light') },
  { value: ThemeEnum.Dark, label: t('app.settings.appearance.theme.dark') },
])

const languageOptions = computed(() => [
  { value: LanguageEnum.English, label: t('app.settings.appearance.language.english') },
  { value: LanguageEnum.zh_CN, label: t('app.settings.appearance.language.zh_cn') },
])

const themeColorOptions = computed(() => [
  { value: ThemeColorEnum.Contrast, label: t('app.settings.appearance.theme_color.contrast') },
  { value: ThemeColorEnum.Blue, label: t('app.settings.appearance.theme_color.blue') },
  { value: ThemeColorEnum.Green, label: t('app.settings.appearance.theme_color.green') },
  { value: ThemeColorEnum.Teal, label: t('app.settings.appearance.theme_color.teal') },
  { value: ThemeColorEnum.Orange, label: t('app.settings.appearance.theme_color.orange') },
  { value: ThemeColorEnum.Purple, label: t('app.settings.appearance.theme_color.purple') },
  { value: ThemeColorEnum.Red, label: t('app.settings.appearance.theme_color.red') },
])

const appTheme = computed({
  get: () => settings.theme,
  set: (theme: ThemeEnum) => {
    settings.theme = theme
    void applyTheme(theme, settings.themeColor)
  },
})

const appThemeColor = computed({
  get: () => settings.themeColor,
  set: (themeColor: ThemeColorEnum) => {
    settings.themeColor = themeColor
    void applyTheme(settings.theme, themeColor)
  },
})

const appLanguage = computed({
  get: () => settings.language,
  set: (language: LanguageEnum) => {
    settings.language = language
    locale.value = language
  },
})
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h2>{{ t('app.settings.appearance.title') }}</h2>
    </header>

    <div class="settings-list">
      <div class="setting-row">
        <div class="setting-copy">
          <strong>{{ t('app.settings.appearance.theme.title') }}</strong>
          <span>{{ t('app.settings.appearance.theme.desc') }}</span>
        </div>
        <UiSelect
          v-model="appTheme"
          :options="themeOptions"
          :aria-label="t('app.settings.appearance.theme.title')"
          min-width="150px"
          content-width="170px"
        />
      </div>

      <div class="setting-row">
        <div class="setting-copy">
          <strong>{{ t('app.settings.appearance.theme_color.title') }}</strong>
          <span>{{ t('app.settings.appearance.theme_color.desc') }}</span>
        </div>
        <div class="theme-color-grid" :aria-label="t('app.settings.appearance.theme_color.title')">
          <button
            v-for="option in themeColorOptions"
            :key="option.value"
            class="theme-color-button"
            :class="[`theme-color-${option.value}`, { active: appThemeColor === option.value }]"
            type="button"
            :title="option.label"
            :aria-label="option.label"
            :aria-pressed="appThemeColor === option.value"
            @click="appThemeColor = option.value"
          >
            <span />
          </button>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-copy">
          <strong>{{ t('app.settings.appearance.language.title') }}</strong>
          <span>{{ t('app.settings.appearance.language.desc') }}</span>
        </div>
        <UiSelect
          v-model="appLanguage"
          :options="languageOptions"
          :aria-label="t('app.settings.appearance.language.title')"
          min-width="150px"
          content-width="170px"
        />
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

  span {
    @apply text-12px light:color-$gray-6 dark:color-$gray-8;
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

.theme-color-grid {
  @apply shrink-0 flex items-center gap-7px;
}

.theme-color-button {
  @apply size-24px rounded-full border p-0 cursor-pointer outline-none;
  @apply inline-flex items-center justify-center;
  @apply transition duration-120 ease-out;
  border-color: var(--ui-input);
  @apply bg-$ui-control-background;

  span {
    @apply size-14px rounded-full;
    background: var(--swatch-color);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--swatch-color), var(--ui-input) 34%);
  }

  &:focus-visible {
    border-color: var(--swatch-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--swatch-color), transparent 78%);
  }

  &.active {
    border-color: var(--swatch-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--swatch-color), transparent 76%);
  }
}

.theme-color-blue {
  --swatch-color: var(--blue-5);
}

.theme-color-contrast {
  --swatch-color: var(--app-foreground);
}

.theme-color-green {
  --swatch-color: var(--green-5);
}

.theme-color-teal {
  --swatch-color: var(--teal-5);
}

.theme-color-orange {
  --swatch-color: var(--orange-5);
}

.theme-color-purple {
  --swatch-color: var(--purple-5);
}

.theme-color-red {
  --swatch-color: var(--red-5);
}
</style>
