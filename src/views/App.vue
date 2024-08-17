<script setup lang="ts">
import WindowHeader from '~/components/WindowHeader.vue'
import { applyTheme, currentTheme } from '~/utils/theme'

import Home from './Home/Home.vue'
import NewProject from './NewProject/NewProject.vue'

const view: Ref<string> = ref('home')

// 在组件挂载时应用默认主题
onMounted(() => {
  applyTheme(currentTheme.value)
})

provide('view', view)
</script>

<template>
  <WindowHeader />
  <Home v-if="view === 'home'" />
  <NewProject v-else />
</template>

<style lang="scss">
body,
html {
  --uno: "m-0 p-0";
  --uno: "size-full";
  --uno: "overflow-hidden";
}

#app {
  --uno: "size-full";
  --uno: "flex flex-col";
  --uno: "bg-$bg-2 text-default";
  --uno: "caret-$caret-color selection:bg-$text-selection";
}
</style>
