<script setup lang="ts">
import '../styles/light.scss'
import '../styles/dark.scss'

import WindowHeader from '~/components/WindowHeader.vue'
import { JeFrame } from '~/jetv-ui'
import { applyTheme } from '~/utils/theme'

import Home from './Home/Home.vue'
import NewProject from './NewProject/NewProject.vue'

const view: Ref<string> = ref('home')

// 在组件挂载时应用默认主题
onMounted(() => {
  applyTheme()
})

provide('view', view)
</script>

<template>
  <JeFrame
    size-full
    flex="~ col"
    caret="theme-text-caret" select-none
  >
    <WindowHeader />
    <Home v-if="view === 'home'" />
    <NewProject v-else />
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
</style>
