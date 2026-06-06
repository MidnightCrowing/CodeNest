<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import { languagesGroup, popupVisible, position } from './LanguagePopProvider'

const popupRef = ref<HTMLElement | null>(null)

onClickOutside(popupRef, () => {
  popupVisible.value = false
})

const { t } = useI18n()

const visibleLanguages = computed(() => languagesGroup.value?.slice(0, 5) || [])
const hiddenLanguageCount = computed(() => Math.max((languagesGroup.value?.length || 0) - visibleLanguages.value.length, 0))
</script>

<template>
  <div
    v-if="popupVisible"
    ref="popupRef"
    class="language-pop"
    :class="{ loading: !languagesGroup?.length }"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
  >
    <div v-if="!languagesGroup?.length" class="loading-panel">
      <span class="state-loader" />
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
          :aria-label="`${languageItem.text} ${languageItem.percentage}%`"
        />
      </div>

      <ul class="language-list">
        <li
          v-for="languageItem in visibleLanguages"
          :key="languageItem.text"
        >
          <div>
            <span class="color-dot" :style="{ backgroundColor: languageItem.color ?? '#ccc' }" />
            {{ languageItem.text }}
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
  </div>
</template>

<style lang="scss" scoped>
.language-pop {
  @apply absolute z-30 w-270px translate-y--100%;
  @apply rounded-6px border px-10px py-9px shadow-lg;
  @apply border-$ui-border bg-$ui-popover-background color-$ui-foreground;
  @apply backdrop-blur-8px backdrop-saturate-140;
}

.language-pop.loading {
  @apply w-52px px-0 py-0;
}

.loading-panel {
  @apply h-42px flex items-center justify-center;
}

.state-loader {
  @apply block size-13px shrink-0 rounded-full border-2;
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
  @apply m-0 p-0 flex flex-col gap-6px list-none;
}

.language-list li {
  @apply min-w-0 flex items-center justify-between gap-10px text-12px;

  div {
    @apply min-w-0 flex items-center gap-5px truncate;
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

@keyframes state-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
