<script setup lang="ts">
import ProjectOverview from './ProjectOverview/ProjectOverview.vue'
import SidePanel from './SidePanel/SidePanel.vue'
</script>

<template>
  <div
    flex="~ row items-stretch"
    overflow-hidden
  >
    <SidePanel min-w="225px" max-w="225px" />
    <ProjectOverview grow flex="~ col" overflow-hidden />
  </div>
</template>
