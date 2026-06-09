<script lang="ts" setup>
import {
  RadioGroupItem,
  RadioGroupRoot,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'

import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import { LanguageEnum, ThemeColorEnum, ThemeEnum } from '~/constants/appEnums'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme } from '~/utils/theme'

import SettingsPage from '../components/SettingsPage.vue'
import SettingsRow from '../components/SettingsRow.vue'

const settings = useSettingsStore()
const { locale, t } = useI18n()
const customColorInputRef = ref<HTMLInputElement | null>(null)

const themeOptions = computed(() => [
  { value: ThemeEnum.System, label: t('app.settings.appearance.theme.system') },
  { value: ThemeEnum.Light, label: t('app.settings.appearance.theme.light') },
  { value: ThemeEnum.Dark, label: t('app.settings.appearance.theme.dark') },
])

const languageOptions = computed(() => [
  // Keep this as a segmented control while the language list stays short.
  // Switch it back to UiSelect if more languages are added later.
  { value: LanguageEnum.English, label: t('app.settings.appearance.language.english') },
  { value: LanguageEnum.zh_CN, label: t('app.settings.appearance.language.zh_cn') },
  { value: LanguageEnum.zh_TW, label: t('app.settings.appearance.language.zh_tw') },
])

const themeColorOptions = computed(() => [
  { value: ThemeColorEnum.Contrast, label: t('app.settings.appearance.theme_color.contrast') },
  { value: ThemeColorEnum.System, label: t('app.settings.appearance.theme_color.system') },
  { value: ThemeColorEnum.Blue, label: t('app.settings.appearance.theme_color.blue') },
  { value: ThemeColorEnum.Green, label: t('app.settings.appearance.theme_color.green') },
  { value: ThemeColorEnum.Teal, label: t('app.settings.appearance.theme_color.teal') },
  { value: ThemeColorEnum.Orange, label: t('app.settings.appearance.theme_color.orange') },
  { value: ThemeColorEnum.Purple, label: t('app.settings.appearance.theme_color.purple') },
  { value: ThemeColorEnum.Red, label: t('app.settings.appearance.theme_color.red') },
  { value: ThemeColorEnum.Custom, label: t('app.settings.appearance.theme_color.custom') },
])

const appTheme = computed({
  get: () => settings.theme,
  set: (theme: ThemeEnum) => {
    settings.theme = theme
    void applyTheme(theme, settings.themeColor, settings.customThemeColor)
  },
})

const appThemeColor = computed({
  get: () => settings.themeColor,
  set: (themeColor: ThemeColorEnum) => {
    settings.themeColor = themeColor
    void applyTheme(settings.theme, themeColor, settings.customThemeColor)
  },
})

const appCustomThemeColor = computed({
  get: () => settings.customThemeColor,
  set: (customThemeColor: string) => {
    settings.customThemeColor = customThemeColor
    settings.themeColor = ThemeColorEnum.Custom
    void applyTheme(settings.theme, ThemeColorEnum.Custom, customThemeColor)
  },
})

const appLanguage = computed({
  get: () => settings.language,
  set: (language: LanguageEnum) => {
    settings.language = language
    locale.value = language
  },
})

function selectThemeColor(value: unknown) {
  if (!Object.values(ThemeColorEnum).includes(value as ThemeColorEnum))
    return

  const themeColor = value as ThemeColorEnum
  appThemeColor.value = themeColor
  if (themeColor === ThemeColorEnum.Custom) {
    void nextTick(() => {
      customColorInputRef.value?.click()
    })
  }
}

function updateCustomThemeColor(event: Event) {
  const input = event.target as HTMLInputElement
  appCustomThemeColor.value = input.value
}

function themeColorButtonStyle(themeColor: ThemeColorEnum) {
  if (themeColor !== ThemeColorEnum.Custom)
    return undefined

  return {
    '--swatch-color': settings.customThemeColor,
  }
}
</script>

<template>
  <SettingsPage :title="t('app.settings.appearance.title')">
    <SettingsRow
      :title="t('app.settings.appearance.theme.title')"
    >
      <UiSegmentedControl
        v-model="appTheme"
        :options="themeOptions"
        :aria-label="t('app.settings.appearance.theme.title')"
      />
    </SettingsRow>

    <SettingsRow
      :title="t('app.settings.appearance.theme_color.title')"
    >
      <RadioGroupRoot
        as-child
        orientation="horizontal"
        :model-value="appThemeColor"
        @update:model-value="selectThemeColor"
      >
        <div class="theme-color-grid" :aria-label="t('app.settings.appearance.theme_color.title')">
          <RadioGroupItem
            v-for="option in themeColorOptions"
            :key="option.value"
            class="theme-color-button"
            :class="[`theme-color-${option.value}`, { active: appThemeColor === option.value }]"
            :style="themeColorButtonStyle(option.value)"
            :value="option.value"
            :title="option.label"
            :aria-label="option.label"
          >
            <span class="theme-color-swatch" />
            <span
              v-if="option.value === ThemeColorEnum.Custom"
              class="theme-color-icon i-lucide:pipette"
            />
          </RadioGroupItem>
          <input
            ref="customColorInputRef"
            :value="appCustomThemeColor"
            class="custom-color-input"
            type="color"
            tabindex="-1"
            aria-hidden="true"
            @input="updateCustomThemeColor"
          >
        </div>
      </RadioGroupRoot>
    </SettingsRow>

    <SettingsRow
      :title="t('app.settings.appearance.language.title')"
    >
      <UiSegmentedControl
        v-model="appLanguage"
        :options="languageOptions"
        :aria-label="t('app.settings.appearance.language.title')"
      />
    </SettingsRow>
  </SettingsPage>
</template>

<style lang="scss" scoped>
.theme-color-grid {
  @apply relative shrink-0 flex items-center gap-7px;
}

.theme-color-button {
  @apply relative size-24px rounded-full border p-0 cursor-pointer outline-none;
  @apply inline-flex items-center justify-center;
  @apply transition duration-120 ease-out;
  border-color: var(--ui-input);
  @apply bg-$ui-control-background;

  .theme-color-swatch {
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

.theme-color-system {
  --swatch-color: var(--system-theme-color);
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

.theme-color-custom {
  --swatch-color: var(--custom-theme-color);
}

.theme-color-icon {
  @apply absolute text-10px;
  color: var(--custom-theme-foreground);
}

.custom-color-input {
  @apply absolute size-1px opacity-0 pointer-events-none;
}
</style>
