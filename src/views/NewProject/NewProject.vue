<script setup lang="ts">
import Input from '~/components/Input.vue'
import PathInput from '~/components/PathInput.vue'

import ConfigItem from './components/ConfigItem.vue'
import ConfigItemTitle from './components/ConfigItemTitle.vue'
import Hr from './components/Hr.vue'
import KindComponent from './components/KindComponent/KindComponent.vue'
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

    <KindComponent />
  </div>
</template>

<style scoped lang="scss">
</style>
