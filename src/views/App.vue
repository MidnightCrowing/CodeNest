<script setup lang="ts">
import '../styles/light.scss'
import '../styles/dark.scss'

import WindowHeader from '~/components/WindowHeader.vue'
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
  <div
    size-full
    flex="~ col"
    bg="theme-panel-bgContent selection:theme-text-selection"
    text-default
    caret="theme-text-caret"
  >
    <WindowHeader />
    <Home v-if="view === 'home'" />
    <NewProject v-else />
  </div>
</template>

<style lang="scss">
body,
html,
#app {
  --uno: "m-0 p-0";
  --uno: "size-full";
  --uno: "overflow-hidden";
}
</style>
