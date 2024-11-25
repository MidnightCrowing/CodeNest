<script lang="ts" setup>
import '../styles/light.scss'
import '../styles/dark.scss'

import WindowHeader from '~/components/WindowHeader.vue'
import { View } from '~/constants/viewEnums'
import { JeFrame } from '~/jetv-ui'
import { applyTheme } from '~/utils/theme'

import Home from './Home/Home.vue'

const activatedView: Ref<View> = ref(View.Home)
const viewComponents = {
  [View.Home]: Home,
  [View.NewProject]: defineAsyncComponent(() => import('./NewProject/NewProject.vue')),
}

// 在组件挂载时应用默认主题
onMounted(() => {
  applyTheme()
})

provide('activatedView', activatedView)
</script>

<template>
  <JeFrame
    size-full
    flex="~ col"
    caret="theme-text-caret" select-none
  >
    <WindowHeader />
    <Component :is="viewComponents[activatedView]" grow />
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
