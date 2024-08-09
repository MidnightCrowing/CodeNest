<script setup lang="ts">
import ButtonGroup from '~/components/ButtonGroup.vue'
import CheckBox from '~/components/CheckBox.vue'
import Input from '~/components/Input.vue'
import PathInput from '~/components/PathInput.vue'
import { ProjectKind } from '~/constants/projectKind'

import ConfigItem from './components/ConfigItem.vue'
import ConfigItemTitle from './components/ConfigItemTitle.vue'
import Hr from './components/Hr.vue'

const kindButtons: { label: string, key: ProjectKind }[] = [
  { label: 'Mine', key: ProjectKind.MINE },
  { label: 'Fork', key: ProjectKind.FORK },
  { label: 'Clone', key: ProjectKind.CLONE },
]
const kindSelected: Ref<ProjectKind> = ref(ProjectKind.MINE)
</script>

<template>
  <div
    size-full
    bg="$bg-1"
  >
    <ConfigItem>
      <ConfigItemTitle title="new_project.name" />
      <Input w="200px" />
      <ConfigItemTitle title="new_project.location" />
      <PathInput grow />
    </configitem>

    <Hr />

    <ConfigItem>
      <ConfigItemTitle title="new_project.project_from" />
      <ButtonGroup
        v-model="kindSelected"
        :buttons="kindButtons"
      />

      <template v-if="kindSelected === ProjectKind.MINE">
        <div>1</div>
        <CheckBox />
      </template>

      <template v-else-if="kindSelected === ProjectKind.FORK">
        <div>2</div>
      </template>

      <template v-else-if="kindSelected === ProjectKind.CLONE">
        <div>3</div>
      </template>

      <template v-else-if="kindSelected === ProjectKind.TEST">
        <div>4</div>
      </template>
    </ConfigItem>
  </div>
</template>

<style scoped lang="scss">
</style>
