<script setup lang="ts">
import ButtonGroup from '~/components/ButtonGroup.vue'
import { ProjectKind } from '~/constants/projectKind'

import ConfigItem from '../ConfigItem.vue'
import ConfigItemTitle from '../ConfigItemTitle.vue'
import CloneComponent from './CloneComponent.vue'
import ForkComponent from './ForkComponent.vue'
import MineComponent from './MineComponent.vue'

const kindButtons: { label: string, key: ProjectKind }[] = [
  { label: 'Mine', key: ProjectKind.MINE },
  { label: 'Fork', key: ProjectKind.FORK },
  { label: 'Clone', key: ProjectKind.CLONE },
]
const kindSelected: Ref<ProjectKind> = ref(ProjectKind.MINE)
const selectedValue = ref('')

const currentComponent = computed(() => {
  switch (kindSelected.value) {
    case ProjectKind.MINE:
      return MineComponent
    case ProjectKind.FORK:
      return ForkComponent
    case ProjectKind.CLONE:
      return CloneComponent
    default:
      return null
  }
})

function submitSettings() {
  // 在这里处理或提交所有的设置项
}
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.kind_component.project_from" />
    <ButtonGroup
      v-model="kindSelected"
      :buttons="kindButtons"
    />

    <KeepAlive>
      <component
        :is="currentComponent"
        v-model:value="selectedValue"
      />
    </KeepAlive>
  </ConfigItem>

  <button @click="submitSettings">
    提交
  </button>
</template>

<style scoped lang="scss">

</style>
