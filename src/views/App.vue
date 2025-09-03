<script lang="ts" setup>
import { JeFrame } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import NoIdePathDialog from '~/components/NoIdePathDialog/NoIdePathDialog.vue'
import RemoveProjectDialog from '~/components/RemoveProjectDialog/RemoveProjectDialog.vue'
import WindowHeader from '~/components/WindowHeader.vue'
import type { LanguageEnum } from '~/constants/appEnums'
import { ViewEnum } from '~/constants/appEnums'
import { useProjectsStore } from '~/stores/projects'
import { useSettingsStore } from '~/stores/settings'
import { applyTheme } from '~/utils/theme'

import Home from './Home/Home.vue'

const projects = useProjectsStore()
const settings = useSettingsStore()
const { locale } = useI18n()

const activatedView: Ref<ViewEnum> = ref(ViewEnum.Home)
const viewComponents: Record<ViewEnum, Component> = {
  [ViewEnum.Home]: Home,
  [ViewEnum.NewProject]: defineAsyncComponent(() => import('./ProjectConfig/ProjectConfig.vue')),
  [ViewEnum.Settings]: defineAsyncComponent(() => import('./Settings/Settings.vue')),
}

async function applyLanguage(lang: LanguageEnum) {
  locale.value = lang
}

onMounted(async () => {
  await Promise.all([
    (async () => {
      await settings.loadSettings()
      await Promise.all([
        applyTheme(settings.theme),
        applyLanguage(settings.language),
      ])
    })(),
    projects.loadProjects(),
  ])
})

provide('activatedView', activatedView)
</script>

<template>
  <JeFrame
    size-full
    flex="~ col"
    caret="theme-text-caret" select-none
  >
    <WindowHeader shrink-0 />
    <KeepAlive include="Home">
      <Component :is="viewComponents[activatedView]" grow />
    </KeepAlive>

    <!-- Dialog -->
    <RemoveProjectDialog />
    <NoIdePathDialog />
  </JeFrame>
</template>

<style lang="scss">
body,
html,
#app {
  @apply m-0 p-0;
  @apply size-full;
  @apply overflow-hidden;
}

::selection {
  @apply light:bg-$gray-11 dark:bg-$gray-5;
}
</style>
