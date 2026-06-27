<script lang="ts" setup>
import '~/styles'

import { useI18n } from 'vue-i18n'

import RemoveProjectDialog from '~/components/RemoveProjectDialog/RemoveProjectDialog.vue'
import UiToaster from '~/components/ui/UiToaster.vue'
import WindowHeader from '~/components/WindowHeader.vue'
import type { LanguageEnum } from '~/constants/appEnums'
import { ThemeColorEnum, ThemeEnum, ViewEnum } from '~/constants/appEnums'
import { addNewProjectsFromScanner, scannerBusy } from '~/services/projectScannerService'
import { useEditorLangGroupsStore } from '~/stores/editorLangGroupsStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme, watchSystemTheme } from '~/utils/theme'
import Home from '~/views/HomeView/HomeView.vue'

const settingsStore = useSettingsStore()
const projectsStore = useProjectsStore()
const editorLangGroupsStore = useEditorLangGroupsStore()
const { locale } = useI18n()
const useNativeTitleBar = navigator.userAgent.includes('Mac OS') || navigator.platform.toLowerCase().includes('mac')

const activatedView: Ref<ViewEnum> = ref(ViewEnum.Home)
const viewComponents: Record<ViewEnum, Component> = {
  [ViewEnum.Home]: Home,
  [ViewEnum.ProjectEditor]: defineAsyncComponent(
    () => import('~/views/ProjectEditorView/ProjectEditorView.vue'),
  ),
  [ViewEnum.Settings]: defineAsyncComponent(
    () => import('~/views/SettingsView/SettingsView.vue'),
  ),
}
const WINDOW_ACTIVATION_DEBOUNCE_MS = 1000
const FOCUS_AUTO_SCAN_INTERVAL_MS = 15 * 60 * 1000
let stopWatchingSystemTheme: (() => void) | null = null
let lastWindowActivationAt = 0
let lastFocusAutoScanAt = 0

async function applyLanguage(lang: LanguageEnum) {
  locale.value = lang
}

function applyCurrentTheme(refreshSystemThemeColor = false) {
  return applyTheme(settingsStore.theme, settingsStore.themeColor, settingsStore.customThemeColor, {
    refreshSystemThemeColor,
  })
}

function runDeferred(task: () => void) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1600 })
    return
  }
  globalThis.setTimeout(task, 900)
}

function refreshSystemThemeColorOnActivation() {
  if (settingsStore.themeColor !== ThemeColorEnum.System)
    return

  void applyCurrentTheme(true)
}

function maybeRunFocusAutoScan() {
  if (!settingsStore.scanner.scanOnWindowFocus || !settingsStore.scannerEnabled || scannerBusy.value)
    return

  const now = Date.now()
  if (now - lastFocusAutoScanAt < FOCUS_AUTO_SCAN_INTERVAL_MS)
    return

  lastFocusAutoScanAt = now
  void addNewProjectsFromScanner().catch((error) => {
    console.error('Project scanner failed:', error)
  })
}

function handleWindowActivation() {
  if (document.visibilityState === 'hidden')
    return

  const now = Date.now()
  if (now - lastWindowActivationAt < WINDOW_ACTIVATION_DEBOUNCE_MS)
    return

  lastWindowActivationAt = now
  refreshSystemThemeColorOnActivation()
  maybeRunFocusAutoScan()
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible')
    handleWindowActivation()
}

if (settingsStore.hydrateCachedSettings()) {
  void applyCurrentTheme()
  void applyLanguage(settingsStore.language)
}
void projectsStore.loadProjects()

onMounted(async () => {
  await settingsStore.loadSettings()

  await Promise.all([
    applyCurrentTheme(),
    applyLanguage(settingsStore.language),
  ])

  stopWatchingSystemTheme = watchSystemTheme((systemTheme) => {
    settingsStore.setSystemTheme(systemTheme)
    if (settingsStore.theme === ThemeEnum.System)
      void applyCurrentTheme(settingsStore.themeColor === ThemeColorEnum.System)
  })

  window.addEventListener('focus', handleWindowActivation)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  runDeferred(() => {
    void editorLangGroupsStore.loadEditorLangGroupsData()
      .then(() => addNewProjectsFromScanner())
      .then(() => {
        if (settingsStore.scannerEnabled)
          lastFocusAutoScanAt = Date.now()
      })
      .catch((error) => {
        console.error('Project scanner failed:', error)
      })
  })
})

onBeforeUnmount(() => {
  stopWatchingSystemTheme?.()
  window.removeEventListener('focus', handleWindowActivation)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

provide('activatedView', activatedView)
</script>

<template>
  <main
    size-full flex flex-col select-none
    :style="{ '--window-titlebar-height': useNativeTitleBar ? '0px' : '40px' }"
  >
    <WindowHeader v-if="!useNativeTitleBar" shrink-0 />
    <KeepAlive include="Home">
      <Component :is="viewComponents[activatedView]" grow />
    </KeepAlive>

    <!-- Dialog -->
    <RemoveProjectDialog />
    <UiToaster />
  </main>
</template>

<style lang="scss" scoped>
main {
  @apply caret-$theme-text-caret;
}
</style>
