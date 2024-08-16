<script setup lang="ts">
import Input from '~/components/common/Input.vue'
import PathInput from '~/components/common/PathInput.vue'

import ConfigItem from './components/common/ConfigItem.vue'
import ConfigItemTitle from './components/common/ConfigItemTitle.vue'
import KindComponent from './components/KindComponent/KindComponent.vue'
import MainLanguageComponent from './components/MainLanguageComponent/MainLanguageComponent.vue'
</script>

<template>
  <div
    size-full
    bg="$bg-1"
    flex="~ col" gap="y-15px"
  >
    <ConfigItem>
      <ConfigItemTitle title="new_project.name" />
      <Input w="200px" />
      <ConfigItemTitle title="new_project.location" />
      <PathInput grow />
    </configitem>

    <KindComponent />

    <MainLanguageComponent />
  </div>
</template>

<style scoped lang="scss">
</style>
