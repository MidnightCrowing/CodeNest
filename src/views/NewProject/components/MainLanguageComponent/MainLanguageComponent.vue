<script setup lang="ts">
import DropDownList from '~/components/common/Drop-downList.vue'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const selectedValue = ref('option1')

const options = [
  { value: 'option1', text: '选项 1', icon: 'i-static-jetbrains-goland', note: '注释 1' },
  { value: 'option2', text: '选项 2', icon: 'i-static-visual-studio', note: '注释 2' },
  { value: 'option3', text: '选项 3' },
]
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.main_lang_component.main_lang" />

    <DropDownList
      v-model="selectedValue"
      :options="options"
    />
    <ConfigItemTitle title="你选择了" />
    <p>{{ selectedValue }}</p>
  </configitem>
</template>

<style scoped lang="scss">

</style>
