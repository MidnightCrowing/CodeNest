<script lang="ts" setup>
import { JeFrame } from '~/jetv-ui'

import ProjectOverview from './ProjectOverview/ProjectOverview.vue'
import SidePanel from './SidePanel.vue'
</script>

<template>
  <JeFrame
    flex="~ row items-stretch"
    overflow-hidden
  >
    <SidePanel max-w="225px" />
    <ProjectOverview grow flex="~ col" overflow-hidden />
  </JeFrame>
</template>
