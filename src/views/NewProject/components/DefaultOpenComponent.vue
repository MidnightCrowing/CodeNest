<script setup lang="ts">
import { JeDropdown } from '~/jetv-ui'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const selectedValue = ref('')
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.default_opening_method" />
    <JeDropdown
      v-model:modelValue="selectedValue"
      :options="[
        {
          value: 1,
          label: 'Intellij IDEA',
          description: 'Java  Kotlin  Spring',
          icon: 'i-jet:jetbrains-intellij-idea',
        },
        {
          value: 2,
          label: 'PyCharm',
          description: 'Python  Django  Jupyter',
          icon: 'i-jet:jetbrains-pycharm',
          ellipsis: true,
        },
        {
          value: 3,
          label: 'PhpStorm',
          description: 'PHP  Laravel  Symfony',
          icon: 'i-jet:jetbrains-phpstorm',
          ellipsis: true,
        },
        { value: 4, isLine: true },
        {
          value: 3,
          label: '下载',
          onClick: () => {
            console.log('下载')
          },
        },
      ]"
    />
    <!--    <DropdownList -->
    <!--      v-model:modelValue="selectedValue" -->
    <!--      :error="dropdownListErrorValue" -->
    <!--      :options="appOptions" -->
    <!--      w="400px" -->
    <!--    /> -->
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
