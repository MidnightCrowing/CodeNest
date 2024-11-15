<script setup lang="ts">
import { ProjectKind } from '~/constants/projectKind'
import { JeSegmentedControl } from '~/jetv-ui'

import ConfigItem from '../common/ConfigItem.vue'
import ConfigItemTitle from '../common/ConfigItemTitle.vue'
import ForkAndCloneComponent from './ForkAndCloneComponent.vue'
import MineComponent from './MineComponent.vue'

const kindButtons: { label: string, value: ProjectKind }[] = [
  { label: 'Mine', value: ProjectKind.MINE },
  { label: 'Fork', value: ProjectKind.FORK },
  { label: 'Clone', value: ProjectKind.CLONE },
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
      :labels="kindButtons"
    />

    <KeepAlive>
      <component
        :is="currentComponent"
        v-model:value="selectedValue"
      />
    </KeepAlive>
  </ConfigItem>
</template>
