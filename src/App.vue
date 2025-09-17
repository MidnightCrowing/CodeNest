<script lang="ts" setup>
import '~/styles'

import { JeFrame } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import NoIdePathDialog from '~/components/NoIdePathDialog/NoIdePathDialog.vue'
import RemoveProjectDialog from '~/components/RemoveProjectDialog/RemoveProjectDialog.vue'
import WindowHeader from '~/components/WindowHeader.vue'
import type { LanguageEnum } from '~/constants/appEnums'
import { ViewEnum } from '~/constants/appEnums'
import { addNewProjectsInWorker } from '~/services/projectScannerService'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { applyTheme } from '~/utils/theme'
import Home from '~/views/HomeView/HomeView.vue'

const projects = useProjectsStore()
const settings = useSettingsStore()
const { locale } = useI18n()

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

onMounted(async () => {
  await Promise.all([
    // settings
    (async () => {
      await settings.loadSettings()
      await Promise.all([applyTheme(settings.theme), applyLanguage(settings.language)])
    })(),

    // projects
    (async () => {
      await projects.loadProjects()
      void addNewProjectsInWorker()
    })(),
  ])
})

provide('activatedView', activatedView)
</script>

<template>
  <JeFrame size-full flex="~ col" caret="theme-text-caret" select-none>
    <WindowHeader shrink-0 />
    <KeepAlive include="Home">
      <Component :is="viewComponents[activatedView]" grow />
    </KeepAlive>

    <!-- Dialog -->
    <RemoveProjectDialog />
    <NoIdePathDialog />
  </JeFrame>
</template>
