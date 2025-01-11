<script lang="ts" setup>
import '../styles/transitionAndTransitionGroup.scss'

import { JeFrame } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import NoIdePathDialog from '~/components/NoIdePathDialog/NoIdePathDialog.vue'
import RemoveProjectDialog from '~/components/RemoveProjectDialog/RemoveProjectDialog.vue'
import WindowHeader from '~/components/WindowHeader.vue'
import type { ThemeEnum } from '~/constants/appEnums'
import { ViewEnum } from '~/constants/appEnums'
import { settings } from '~/core/settings'
import { applyTheme } from '~/utils/theme'

import Home from './Home/Home.vue'

const { locale } = useI18n()

const activatedView: Ref<ViewEnum> = ref(ViewEnum.Home)
const viewComponents: Record<ViewEnum, Component> = {
  [ViewEnum.Home]: Home,
  [ViewEnum.NewProject]: defineAsyncComponent(() => import('~/components/ProjectConfig/ProjectConfig.vue')),
  [ViewEnum.Settings]: defineAsyncComponent(() => import('./Settings/Settings.vue')),
}

async function applyLanguage(lang: string) {
  locale.value = lang
}

onMounted(async () => {
  await settings.loadSettings()

  const themeSetting = settings.getSetting('theme' as ThemeEnum)
  const languageSetting = settings.getSetting('language')

  await Promise.all([
    applyTheme(themeSetting),
    applyLanguage(languageSetting),
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
    <KeepAlive include="Home,Settings">
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
