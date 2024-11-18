<script setup lang="ts">
import { JeButton, JeFrame } from '~/jetv-ui'

import DefaultOpenComponent from './components/DefaultOpenComponent.vue'
import KindComponent from './components/KindComponent/KindComponent.vue'
import MainLanguageComponent from './components/MainLanguageComponent.vue'
import ProjectInfoComponent from './components/ProjectInfoComponent.vue'

const view = inject('view') as Ref<string>

function changeView() {
  if (view)
    view.value = 'home'
}
</script>

<template>
  <JeFrame
    size-full
    bg="theme-panel-bgDialog"
    flex="~ col"
  >
    <JeFrame
      type="secondary"
      grow
      flex="~ col" gap="y-15px"
      overflow-auto scrollbar-default
    >
      <ProjectInfoComponent />

      <KindComponent />

      <MainLanguageComponent />

      <DefaultOpenComponent />
    </JeFrame>

    <JeFrame
      type="secondary"
      b-t="solid 2px light:$gray-12 dark:$gray-3" p="8px"
      flex="~ row-reverse" gap="8px"
    >
      <JeButton class="cancel-button" type="secondary" @click="changeView">
        取消
      </JeButton>
      <JeButton>添加</JeButton>
    </JeFrame>
  </JeFrame>
</template>

<style lang="scss" scoped>
.cancel-button.je-button.secondary {
  // light
  @apply light:bg-$gray-14 dark:bg-$gray-2;

  // dark
  @apply dark:bg-$gray-2 dark:hover:bg-$gray-3;
}
</style>
