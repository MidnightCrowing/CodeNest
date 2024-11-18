<script setup lang="ts">
import { codeEditors } from '~/constants/codeEditor'
import { JeDropdown } from '~/jetv-ui'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const mainLangValue = ref()
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.main_lang_project" />
    <JeDropdown
      :model-value="mainLangValue"
      :options="codeEditors"
    />
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
