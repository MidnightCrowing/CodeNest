<script lang="ts" setup>
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'

import { ThemeEnum } from '~/constants/appEnums'
import { useSettingsStore } from '~/stores/settingsStore'
import { useDelayedBusy } from '~/utils/useDelayedBusy'

import { analyzing, anchorElement, getAnalyzeError, hidePop, languagesGroup, popupVisible } from './LanguagePopProvider'

const settingsStore = useSettingsStore()
const { t } = useI18n()

const visibleLanguages = computed(() => languagesGroup.value?.slice(0, 5) || [])
const hiddenLanguageCount = computed(() => Math.max((languagesGroup.value?.length || 0) - visibleLanguages.value.length, 0))
const isDarkTheme = computed(() => settingsStore.resolvedTheme === ThemeEnum.Dark)
const visibleAnalyzing = useDelayedBusy(analyzing, { delay: 220, minDuration: 320 })
const hasLanguages = computed(() => !!languagesGroup.value?.length)
const shouldRenderContent = computed(() =>
  hasLanguages.value
  || visibleAnalyzing.value
  || getAnalyzeError.value === true
  || (!analyzing.value && !hasLanguages.value),
)

function updateOpen(open: boolean) {
  if (!open)
    hidePop()
}

function languageLabel(text: string) {
  return text === 'Other' ? t('language_pop.other') : text
}
</script>

<template>
  <PopoverRoot
    :open="popupVisible"
    @update:open="updateOpen"
  >
    <PopoverPortal v-if="anchorElement && shouldRenderContent">
      <PopoverContent
        class="language-pop"
        :class="{ 'loading': visibleAnalyzing || !hasLanguages, 'dark-language-pop': isDarkTheme }"
        :reference="anchorElement"
        side="top"
        align="start"
        :side-offset="6"
        :align-offset="-5"
        :collision-padding="8"
        @open-auto-focus.prevent
        @close-auto-focus.prevent
      >
        <div v-if="visibleAnalyzing" class="state-panel">
          <span class="state-loader" />
          <span>{{ t('language_pop.loading') }}</span>
        </div>

        <div v-else-if="getAnalyzeError || !languagesGroup?.length" class="state-panel error">
          <span class="i-lucide:triangle-alert" />
          <span>{{ t('language_pop.failed') }}</span>
        </div>

        <template v-else>
          <header class="language-pop-header">
            <span>{{ t('language_pop.count', { count: languagesGroup.length }) }}</span>
          </header>

          <div class="language-bar" :aria-label="t('language_pop.overall_label')">
            <span
              v-for="languageItem in languagesGroup"
              :key="languageItem.text"
              :style="{ backgroundColor: languageItem.color ?? '#ccc', width: `${languageItem.percentage}%` }"
              :aria-label="`${languageLabel(languageItem.text)} ${languageItem.percentage}%`"
            />
          </div>

          <ul class="language-list">
            <li
              v-for="languageItem in visibleLanguages"
              :key="languageItem.text"
            >
              <div>
                <span class="color-dot" :style="{ backgroundColor: languageItem.color ?? '#ccc' }" />
                {{ languageLabel(languageItem.text) }}
              </div>
              <span>
                {{ languageItem.percentage }}%
              </span>
            </li>
            <li v-if="hiddenLanguageCount" class="more-row">
              <div>{{ t('language_pop.more', { count: hiddenLanguageCount }) }}</div>
            </li>
          </ul>
        </template>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style lang="scss">
.language-pop {
  @apply z-50 w-270px rounded-6px border px-12px py-10px outline-none;
  @apply border-$ui-border color-$ui-foreground;
  @apply backdrop-blur-8px backdrop-saturate-140;
  background: var(--ui-popover-background);
  box-shadow: var(--shadow-popup);

  &[data-state="open"] {
    animation: language-pop-enter 120ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.language-pop.loading {
  @apply w-160px;
}

.state-panel {
  @apply h-44px flex items-center justify-center gap-8px;
  @apply text-12px color-$ui-muted-foreground;
}

.state-panel.error {
  @apply color-$red-5;
}

.state-loader {
  @apply block size-13px shrink-0 rounded-full border-2;
  border-style: solid;
  border-color: var(--ui-border);
  border-top-color: var(--ui-primary);
  animation: state-loader-spin 0.75s linear infinite;
}

.language-pop-header {
  @apply mb-8px flex items-center justify-end;

  > span {
    @apply shrink-0 text-11px color-$ui-muted-foreground;
  }
}

.language-bar {
  @apply h-6px mb-9px rounded-full overflow-hidden flex gap-1px bg-$ui-hover-background;

  span {
    @apply block h-full;
  }
}

.language-list {
  @apply m-0 p-0 flex flex-col gap-7px list-none;
}

.language-list li {
  @apply min-w-0 flex items-center justify-between gap-10px text-12px;

  div {
    @apply min-w-0 flex items-center gap-6px truncate;
  }

  > span {
    @apply shrink-0 light:color-$gray-7 dark:color-$gray-8;
  }
}

.language-list .more-row {
  @apply justify-start text-11px color-$ui-muted-foreground;
}

.color-dot {
  @apply size-8px rounded-full shrink-0;
}

.language-pop.dark-language-pop {
  background: color-mix(in srgb, var(--ui-page-background), var(--gray-2) 72%);
  border-color: color-mix(in srgb, var(--ui-border), var(--gray-14) 10%);
  backdrop-filter: none;
}

.language-pop.dark-language-pop .language-bar {
  background: color-mix(in srgb, var(--ui-page-background), var(--gray-14) 6%);
}

.language-pop.dark-language-pop .language-bar span {
  opacity: 0.74;
  filter: saturate(0.72) brightness(0.92);
}

.language-pop.dark-language-pop .color-dot {
  opacity: 0.84;
  filter: saturate(0.72) brightness(0.94);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 10%);
}

@keyframes state-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes language-pop-enter {
  from {
    opacity: 0;
    transform: translateY(3px) scale(0.985);
  }
}
</style>
