<script setup lang="ts">
import { ref } from 'vue'

import DropdownList from '~/components/common/DropdownList.vue'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const selectedValue = ref('option52')

const dropdownOptions = [
  { value: 'option1', text: '选项 1', icon: 'i-static-jetbrains-goland', note: '注释 1', group: 'jetbrains' },
  { value: 'option2', text: '选项 2', icon: 'i-static-visual-studio', note: '注释 2', group: 'jetbrains' },
  { value: 'option3', text: '选项 3', group: 'jetbrains' },
  { value: 'option4', text: '选项 4', note: '注释 4', group: 'minecraft' },
  { value: 'option5', text: '选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
  { value: 'option5', text: '选项 5' },
]
</script>

<template>
  <ConfigItem>
    <div />
    <DropdownList
      v-model:modelValue="selectedValue"
      :options="dropdownOptions"
    />
    <ConfigItemTitle title="你选择了" />
    <p>{{ selectedValue }}</p>
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
