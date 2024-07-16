<script setup lang="ts">
import { onMounted, ref } from 'vue'

import WindowHeader from '~/components/WindowHeader.vue'

import ProjectOverview from './ProjectOverview/ProjectOverview.vue'
import SidePanel from './SidePanel/SidePanel.vue'

// 当前主题状态
const currentTheme = ref('dark')

// 应用主题的函数
function applyTheme(theme: string) {
  if (theme === 'dark') {
    import('~/styles/dark.scss')
  }
  else {
    import('~/styles/light.scss')
  }
}

// 切换主题的函数
// function toggleTheme() {
//   currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
//   applyTheme(currentTheme.value)
// }

// 在组件挂载时应用默认主题
onMounted(() => {
  applyTheme(currentTheme.value)
})
</script>

<template>
  <WindowHeader />
  <div
    flex="~ row items-stretch"
    h-full
  >
    <SidePanel w-225px />
    <ProjectOverview grow />
  </div>
</template>

<style lang="scss">
body,
html,
#app {
  --uno: "m-0 p-0";
  --uno: "w-full h-full";
  --uno: "color-$text-color-1 bg-$bg-1";
  --uno: "overflow-hidden";

  ::selection {
    --uno: "bg-$text-selection";
  }
}
</style>
