<script lang="ts" setup>
import '~/styles'

import { useI18n } from 'vue-i18n'

import NoIdePathDialog from '~/components/NoIdePathDialog/NoIdePathDialog.vue'
import RemoveProjectDialog from '~/components/RemoveProjectDialog/RemoveProjectDialog.vue'
import WindowHeader from '~/components/WindowHeader.vue'
import type { LanguageEnum } from '~/constants/appEnums'
import { ViewEnum } from '~/constants/appEnums'
import { addNewProjectsFromScanner } from '~/services/projectScannerService'
import { useEditorLangGroupsStore } from '~/stores/editorLangGroupsStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme } from '~/utils/theme'
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

async function applyLanguage(lang: LanguageEnum) {
  locale.value = lang
}

function runDeferred(task: () => void) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1600 })
    return
  }
  globalThis.setTimeout(task, 900)
}

if (settingsStore.hydrateCachedSettings()) {
  void applyTheme(settingsStore.theme, settingsStore.themeColor, settingsStore.customThemeColor)
  void applyLanguage(settingsStore.language)
}
void projectsStore.loadProjects()

onMounted(async () => {
  await settingsStore.loadSettings()

  await Promise.all([
    applyTheme(settingsStore.theme, settingsStore.themeColor, settingsStore.customThemeColor),
    applyLanguage(settingsStore.language),
  ])

  runDeferred(() => {
    void editorLangGroupsStore.loadEditorLangGroupsData().then(() => addNewProjectsFromScanner())
  })
})

provide('activatedView', activatedView)
</script>

<template>
  <main class="app-shell">
    <WindowHeader v-if="!useNativeTitleBar" shrink-0 />
    <KeepAlive include="Home">
      <Component :is="viewComponents[activatedView]" grow />
    </KeepAlive>

    <!-- Dialog -->
    <RemoveProjectDialog />
    <NoIdePathDialog />
  </main>
</template>

<style lang="scss" scoped>
.app-shell {
  @apply size-full flex flex-col select-none;
  caret-color: var(--theme-text-caret);
}
</style>
