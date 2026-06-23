<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { formatProjectLanguage } from '~/utils/projectFormatters'

import { localProjectItem } from '../ProjectEditorViewProvider'

interface SummaryItem {
  label: string
  value: string
}

defineProps<{
  analyzing: boolean
  effectivePath: string
  isRemote: boolean
  runAnalyzeProject: () => void
  summaryItems: SummaryItem[]
  visibleAnalyzing: boolean
}>()

const { t } = useI18n()
const languageMixBodyRef = ref<HTMLElement | null>(null)
let languageMixHeightTimer: ReturnType<typeof window.setTimeout> | null = null

function displayLanguage(language: string | null | undefined) {
  return formatProjectLanguage(language, t, 'app.project_editor.no_language')
}

watch(
  () => localProjectItem.value.langGroup?.length || 0,
  async () => {
    const body = languageMixBodyRef.value
    if (!body)
      return

    const startHeight = body.offsetHeight
    body.style.height = `${startHeight}px`
    body.style.overflow = 'hidden'

    await nextTick()

    const targetHeight = body.scrollHeight
    if (startHeight === targetHeight) {
      resetLanguageMixBodyHeight()
      return
    }

    if (languageMixHeightTimer !== null)
      window.clearTimeout(languageMixHeightTimer)

    requestAnimationFrame(() => {
      body.style.height = `${targetHeight}px`
    })

    languageMixHeightTimer = window.setTimeout(() => {
      resetLanguageMixBodyHeight()
    }, 180)
  },
  { flush: 'pre' },
)

onBeforeUnmount(() => {
  if (languageMixHeightTimer !== null)
    window.clearTimeout(languageMixHeightTimer)
})

function resetLanguageMixBodyHeight() {
  const body = languageMixBodyRef.value
  if (!body)
    return

  body.style.height = ''
  body.style.overflow = ''
  languageMixHeightTimer = null
}
</script>

<template>
  <aside class="summary-panel" min-w-0 flex flex-col gap-12px>
    <section rounded-6px overflow-hidden bg="$ui-surface-background" shadow="$shadow-surface">
      <header
        min-h-42px px-14px py-8px border-b
        flex items-center justify-between gap-12px
        light:border="$gray-13" dark:border="$gray-3"
      >
        <strong
          min-w-0 truncate text-13px font-650
          :title="localProjectItem.name || t('app.project_editor.unnamed')"
        >
          {{ localProjectItem.name || t('app.project_editor.unnamed') }}
        </strong>
        <span min-w-0 truncate text-12px light:color="$gray-6" dark:color="$gray-8">
          {{ displayLanguage(localProjectItem.mainLang) }}
        </span>
      </header>

      <div
        px-14px py-9px truncate text-12px border-b
        light:border="$gray-13" dark:border="$gray-3"
        light:color="$gray-6" dark:color="$gray-8"
        :title="effectivePath || ''"
      >
        {{ effectivePath || t('app.project_editor.no_folder') }}
      </div>

      <div px-14px py-8px flex flex-col gap-7px>
        <div
          v-for="item in summaryItems" :key="item.label" flex items-center justify-between
          gap-10px
        >
          <span text-12px light:color="$gray-6" dark:color="$gray-8">{{ item.label }}</span>
          <strong min-w-0 truncate text-12px font-620 :title="item.value">{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section v-if="!isRemote" rounded-6px overflow-hidden bg="$ui-surface-background" shadow="$shadow-surface">
      <header
        min-h-42px px-14px py-8px border-b
        flex items-center justify-between gap-12px
        light:border="$gray-13" dark:border="$gray-3"
      >
        <div min-w-0 flex flex-col gap-2px>
          <strong min-w-0 truncate text-13px font-650>{{ t('app.project_editor.language_mix.title') }}</strong>
          <span min-w-0 truncate text-12px light:color="$gray-6" dark:color="$gray-8">
            {{ t('app.project_editor.language_mix.entries', { count: localProjectItem.langGroup?.length || 0 }) }}
          </span>
        </div>
        <button
          class="icon-button"
          size-24px shrink-0
          light:color="$gray-1" dark:color-white
          type="button"
          :title="t('app.project_editor.language_mix.refresh')"
          :aria-label="t('app.project_editor.language_mix.refresh')"
          :disabled="!localProjectItem.path || analyzing"
          @click="runAnalyzeProject"
        >
          <span class="i-lucide:refresh-cw" :class="{ 'animate-spin': visibleAnalyzing }" />
        </button>
      </header>

      <div ref="languageMixBodyRef" class="language-mix-body">
        <Transition name="language-mix">
          <div
            v-if="!localProjectItem.langGroup?.length"
            key="empty"
            px-14px py-10px text-12px
            light:color="$gray-6" dark:color="$gray-8"
          >
            {{ t('app.project_editor.language_mix.empty') }}
          </div>
          <div
            v-else key="list" p-14px flex flex-col
            gap-9px
          >
            <div v-for="language in localProjectItem.langGroup" :key="language.text" flex flex-col gap-5px>
              <div min-w-0 flex items-center gap-6px>
                <span size-8px rounded-full shrink-0 :style="{ background: language.color || '#b8b8b8' }" />
                <strong min-w-0 flex-1 truncate text-12px font-620>{{ displayLanguage(language.text) }}</strong>
                <span text-11px light:color="$gray-6" dark:color="$gray-8">{{ language.percentage }}%</span>
              </div>
              <div class="language-bar">
                <span :style="{ width: `${Math.min(language.percentage, 100)}%`, background: language.color || '#b8b8b8' }" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </section>
  </aside>
</template>

<style lang="scss" scoped>
.language-mix-body {
  @apply relative transition-height duration-150 ease-out;
}

.language-mix-enter-active,
.language-mix-leave-active {
  transition:
    opacity 140ms ease-out,
    transform 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

.language-mix-leave-active {
  @apply absolute left-0 right-0 top-0 pointer-events-none;
}

.language-mix-enter-from,
.language-mix-leave-to {
  @apply opacity-0 translate-y-4px;
}

.language-bar {
  @apply h-4px rounded-full overflow-hidden;
  @apply [background:color-mix(in_srgb,var(--ui-hover-background),var(--ui-foreground)_8%)];

  span {
    @apply block h-full rounded-full;
  }
}

:global(.dark) .language-bar {
  @apply bg-$ui-hover-background;
}

@media (max-width: 960px) {
  .summary-panel {
    @apply hidden;
  }
}
</style>
