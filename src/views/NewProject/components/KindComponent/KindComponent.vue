<script setup lang="ts">
import { ProjectKind } from '~/constants/projectKind'
import { JeSegmentedControl } from '~/jetv-ui'

import ConfigItem from '../common/ConfigItem.vue'
import ConfigItemTitle from '../common/ConfigItemTitle.vue'
import ForkAndCloneComponent from './ForkAndCloneComponent.vue'
import MineComponent from './MineComponent.vue'

const kindButtons: { label: string, index: ProjectKind }[] = [
  { label: 'Mine', index: ProjectKind.MINE },
  { label: 'Fork', index: ProjectKind.FORK },
  { label: 'Clone', index: ProjectKind.CLONE },
]
const kindSelected: Ref<ProjectKind> = ref(ProjectKind.MINE)
const selectedValue = ref('')

const currentComponent = computed(() => {
  switch (kindSelected.value) {
    case ProjectKind.MINE:
      return MineComponent
    case ProjectKind.FORK:
    case ProjectKind.CLONE:
      return ForkAndCloneComponent
    default:
      return null
  }
})
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.kind_component.project_source" />
    <JeSegmentedControl
      v-model="kindSelected"
      :values="kindButtons"
    />

    <KeepAlive>
      <component
        :is="currentComponent"
        v-model:value="selectedValue"
      />
    </KeepAlive>
  </ConfigItem>
</template>
