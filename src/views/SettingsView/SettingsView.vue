<script lang="ts" setup>
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useI18n } from 'vue-i18n'

import { SettingPageEnum, ViewEnum } from '~/constants/appEnums'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme } from '~/utils/theme'

import AboutPage from './pages/About.vue'
import AppearancePage from './pages/Appearance.vue'
import AutoProjectScannerPage from './pages/AutoProjectScanner.vue'
import DataPage from './pages/Data.vue'
import IdesPage from './pages/Ides.vue'
import { activatedPage } from './SettingsViewProvider'

defineOptions({
  name: 'Settings',
})

const settingsStore = useSettingsStore()
const activatedView = inject('activatedView') as Ref<ViewEnum>
const { locale, t } = useI18n()
const settingsContentRef = ref<HTMLElement | null>(null)
const sectionRefs = reactive<Record<SettingPageEnum, HTMLElement | null>>({
  [SettingPageEnum.Appearance]: null,
  [SettingPageEnum.Ides]: null,
  [SettingPageEnum.AutoScan]: null,
  [SettingPageEnum.Data]: null,
  [SettingPageEnum.About]: null,
})

let settingsViewport: HTMLElement | null = null
let ignoreScrollSync = false

const menuItems = computed(() => [
  {
    value: SettingPageEnum.Appearance,
    label: t('app.settings.tabs.appearance.label'),
    desc: t('app.settings.tabs.appearance.desc'),
  },
  {
    value: SettingPageEnum.Ides,
    label: t('app.settings.tabs.editors.label'),
    desc: t('app.settings.tabs.editors.desc'),
  },
  {
    value: SettingPageEnum.AutoScan,
    label: t('app.settings.tabs.scanner.label'),
    desc: t('app.settings.tabs.scanner.desc'),
  },
  {
    value: SettingPageEnum.Data,
    label: t('app.settings.tabs.data.label'),
    desc: t('app.settings.tabs.data.desc'),
  },
  {
    value: SettingPageEnum.About,
    label: t('app.settings.tabs.about.label'),
    desc: t('app.settings.tabs.about.desc'),
  },
])

function setSectionRef(page: SettingPageEnum, element: unknown) {
  sectionRefs[page] = element instanceof HTMLElement ? element : null
}

function updateActivatedPage(page: string | number) {
  const nextPage = page as SettingPageEnum
  activatedPage.value = nextPage
  ignoreScrollSync = true
  nextTick(() => {
    sectionRefs[nextPage]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      ignoreScrollSync = false
      syncActivePageFromScroll()
    }, 360)
  })
}

function syncActivePageFromScroll() {
  if (ignoreScrollSync || !settingsViewport)
    return

  const viewportRect = settingsViewport.getBoundingClientRect()
  let activePage = menuItems.value[0].value

  for (const item of menuItems.value) {
    const section = sectionRefs[item.value]
    if (!section)
      continue

    const sectionTop = section.getBoundingClientRect().top - viewportRect.top
    if (sectionTop <= 48) {
      activePage = item.value
    }
  }

  activatedPage.value = activePage
}

function openSettingsJSON() {
  void window.api.openData('settings')
}

async function saveAllSettings() {
  await applyChanges()
  changeHomeView()
}

async function applyChanges() {
  await settingsStore.saveSettings()
  await syncRuntimeSettings()
}

async function cancelChanges() {
  await settingsStore.loadSettings()
  await syncRuntimeSettings()
  changeHomeView()
}

function changeHomeView() {
  activatedView.value = ViewEnum.Home
}

async function syncRuntimeSettings() {
  await applyTheme(settingsStore.theme, settingsStore.themeColor, settingsStore.customThemeColor)
  locale.value = settingsStore.language
}

onMounted(async () => {
  await settingsStore.loadSettings()
  await syncRuntimeSettings()
  await nextTick()
  settingsViewport = settingsContentRef.value
  settingsViewport?.addEventListener('scroll', syncActivePageFromScroll, { passive: true })

  const initialPage = activatedPage.value
  if (initialPage !== SettingPageEnum.Appearance) {
    sectionRefs[initialPage]?.scrollIntoView({ block: 'start' })
  }

  syncActivePageFromScroll()
})

onUnmounted(() => {
  settingsViewport?.removeEventListener('scroll', syncActivePageFromScroll)
  activatedPage.value = SettingPageEnum.Appearance
})
</script>

<template>
  <main class="settings-shell">
    <header class="settings-topbar">
      <button class="icon-button back-button" type="button" :title="t('app.common.back')" :aria-label="t('app.common.back')" @click="changeHomeView">
        <span class="i-lucide:chevron-left" />
      </button>

      <div class="settings-title">
        <h1>{{ t('app.settings.title') }}</h1>
      </div>

      <TabsRoot
        class="settings-tabs-root"
        :model-value="activatedPage"
        @update:model-value="updateActivatedPage"
      >
        <TabsList class="settings-tabs" :aria-label="t('app.settings.tabs.label')">
          <TabsTrigger
            v-for="item in menuItems"
            :key="item.value"
            class="settings-tab"
            :value="item.value"
            type="button"
          >
            <strong>{{ item.label }}</strong>
            <span>{{ item.desc }}</span>
          </TabsTrigger>
        </TabsList>
      </TabsRoot>

      <div class="settings-actions">
        <button
          class="icon-button json-button"
          type="button"
          :title="t('app.settings.open_json')"
          :aria-label="t('app.settings.open_json')"
          @click="openSettingsJSON"
        >
          <span class="i-lucide:file-json" />
        </button>
        <button class="ghost-button" type="button" @click="cancelChanges">
          {{ t('app.common.cancel') }}
        </button>
        <button class="ghost-button" type="button" @click="applyChanges">
          {{ t('app.common.apply') }}
        </button>
        <button class="primary-button" type="button" @click="saveAllSettings">
          {{ t('app.common.save') }}
        </button>
      </div>
    </header>

    <div ref="settingsContentRef" class="settings-content">
      <section :ref="el => setSectionRef(SettingPageEnum.Appearance, el)" class="settings-section">
        <AppearancePage />
      </section>
      <section :ref="el => setSectionRef(SettingPageEnum.Ides, el)" class="settings-section">
        <IdesPage />
      </section>
      <section :ref="el => setSectionRef(SettingPageEnum.AutoScan, el)" class="settings-section">
        <AutoProjectScannerPage />
      </section>
      <section :ref="el => setSectionRef(SettingPageEnum.Data, el)" class="settings-section">
        <DataPage />
      </section>
      <section :ref="el => setSectionRef(SettingPageEnum.About, el)" class="settings-section">
        <AboutPage />
      </section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.settings-shell {
  @apply size-full overflow-hidden flex flex-col;
  @apply bg-$ui-page-background;
}

.settings-topbar {
  @apply shrink-0 px-14px py-10px grid items-center gap-10px;
  grid-template-columns: auto minmax(128px, auto) minmax(0, 1fr) auto;
}

.settings-title {
  @apply min-w-0 flex items-center;

  h1 {
    @apply m-0 text-17px lh-21px font-650;
  }
}

.settings-tabs-root {
  @apply min-w-0;
}

.settings-tabs {
  @apply min-w-0 flex items-center gap-6px overflow-x-auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.settings-tab {
  @apply h-42px min-w-118px rounded-6px border-0 px-10px bg-transparent text-left cursor-pointer;
  @apply flex flex-col justify-center gap-2px;
  @apply light:color-$gray-4 dark:color-$gray-10;

  strong {
    @apply text-12px font-620;
  }

  span {
    @apply text-11px truncate light:color-$gray-7 dark:color-$gray-8;
  }

  &[data-state="active"] {
    @apply bg-$ui-surface-background color-$ui-foreground;
  }
}

.settings-actions {
  @apply shrink-0 flex items-center gap-6px;
}

.primary-button,
.ghost-button,
.icon-button {
  @apply h-28px border-0 rounded-5px px-9px;
  @apply inline-flex items-center gap-5px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.icon-button {
  @apply w-28px justify-center px-0;
}

.back-button {
  @apply light:bg-transparent dark:bg-transparent;

  span {
    @apply text-16px;
  }
}

.primary-button {
  @apply bg-$ui-primary color-$ui-primary-foreground;
  @apply hover:bg-$ui-primary-hover active:bg-$ui-primary-active;
}

.ghost-button,
.icon-button {
  @apply bg-$ui-surface-background color-$ui-foreground;
  @apply hover:bg-$ui-hover-background;
}

.back-button {
  @apply light:bg-transparent dark:bg-transparent;
  @apply hover:bg-$ui-hover-background;
}

.settings-content {
  @apply min-h-0 min-w-0 mx-14px mb-12px pb-12px flex-1 overflow-y-auto;
  @apply flex flex-col gap-34px;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--ui-muted-foreground), transparent 55%) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--ui-muted-foreground), transparent 55%);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--ui-muted-foreground), transparent 35%);
  }
}

.settings-section {
  @apply box-border px-30px pt-15px pb-5px scroll-mt-8px;

  :deep(.settings-page) {
    @apply gap-12px;
  }

  :deep(.settings-page > :not(.page-header)) {
    @apply px-16px;
  }
}

.settings-section:last-child {
  @apply min-h-full;
}

@media (max-width: 920px) {
  .settings-topbar {
    @apply py-8px gap-8px;
    grid-template-columns: auto minmax(82px, auto) minmax(0, 1fr) auto;
  }

  .settings-tab {
    @apply h-32px min-w-84px px-8px;

    span {
      @apply hidden;
    }
  }

  .settings-actions {
    @apply justify-end gap-5px;
  }

  .primary-button,
  .ghost-button,
  .icon-button {
    @apply h-26px px-8px;
  }

  .icon-button {
    @apply w-26px px-0;
  }

  .json-button {
    @apply hidden;
  }
}

@media (max-width: 720px) {
  .settings-title span {
    @apply hidden;
  }

  .settings-tab {
    @apply min-w-70px;
  }
}
</style>
