<script setup lang="ts">
import { onMounted, ref } from 'vue'

import WindowHeader from '~/components/WindowHeader.vue'
import { Theme } from '~/constants/theme'

import NewProject from './NewProject/NewProject.vue'

import('~/styles/main.scss')
const currentTheme: Ref<Theme> = ref(Theme.dark)

// 应用主题的函数
function applyTheme(theme: Theme) {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.className = theme
  }

  if (theme === Theme.dark) {
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
  <!-- <Home /> -->
  <NewProject />
</template>

<style lang="scss">
body,
html,
#app {
  --uno: "m-0 p-0";
  --uno: "w-full h-full";
  --uno: "color-$text-color-2 bg-$bg-2";
  --uno: "text-default overflow-hidden";
  --uno: "caret-$caret-color selection:bg-$text-selection";
}
</style>
