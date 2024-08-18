<script setup lang="ts">
import Button from '~/components/common/Button.vue'
import ButtonSolid from '~/components/common/ButtonSolid.vue'

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
  <div
    size-full
    bg="theme-panel-bgDialog"
    flex="~ col"
  >
    <div
      grow
      flex="~ col" gap="y-15px"
      overflow-auto scrollbar-default
    >
      <ProjectInfoComponent />

      <KindComponent />

      <MainLanguageComponent />

      <DefaultOpenComponent />
    </div>

    <div
      bg="theme-panel-bgDialog"
      b-t="solid 2px theme-hr-bg" p="8px"
      flex="~ row-reverse" gap="8px"
    >
      <Button @click="changeView">
        取消
      </Button>
      <ButtonSolid>添加</ButtonSolid>
    </div>
  </div>
</template>
