<script setup lang="ts">
import { JeLoader } from 'jetv-ui'

import { latestState } from './StateBarProvider'
</script>

<template>
  <div v-if="latestState">
    <span text="secondary medium" flex="~ row items-center" gap="2px">
      <JeLoader v-if="latestState.loading" />
      {{ latestState.message }}
    </span>
  </div>
</template>
