<script setup lang="ts">
import { JeToolbarDropdown } from '~/jetv-ui'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.main_lang_project" />
    <JeToolbarDropdown
      label="Label"
      :default-selected-value="2"
      :options="[
        {
          value: 1,
          label: 'Intellij IDEA',
        },
        {
          value: 2,
          label: 'PyCharm',
        },
        {
          value: 3,
          label: 'PhpStorm',
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
    <!--      :error="dropdownListErrorValue" -->
    <!--    /> -->
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
