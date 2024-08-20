<script setup lang="ts">
import DropdownList from '~/components/common/DropdownList.vue'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const dropdownListErrorValue = ref(false)
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.main_lang_project" />
    <DropdownList
      :error="dropdownListErrorValue"
    />
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
