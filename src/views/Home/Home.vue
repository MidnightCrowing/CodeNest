<script lang="ts" setup>
import { JeFrame } from '~/jetv-ui'

import ProjectOverview from './ProjectOverview/ProjectOverview.vue'
import SidePanel from './SidePanel.vue'
</script>

<template>
  <JeFrame flex="~ row" overflow-hidden>
    <SidePanel />
    <ProjectOverview grow />
  </JeFrame>
</template>
