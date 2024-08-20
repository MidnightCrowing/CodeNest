<script setup lang="ts">
import DropdownList from '~/components/common/DropdownList.vue'
import { appOptions } from '~/constants/appOptions'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const dropdownListErrorValue = ref(false)
const selectedValue = ref('')
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.default_opening_method" />
    <DropdownList
      v-model:modelValue="selectedValue"
      :error="dropdownListErrorValue"
      :options="appOptions"
      w="400px"
    />
  </ConfigItem>
</template>

<style scoped lang="scss">

</style>
