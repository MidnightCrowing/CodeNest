<script setup lang="ts">
import DropdownList from '~/components/common/DropdownList.vue'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.main_lang_project" />
    <DropdownList />
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
