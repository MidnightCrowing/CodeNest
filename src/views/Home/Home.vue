<script setup lang="ts">
import ProjectOverview from './ProjectOverview/ProjectOverview.vue'
import SidePanel from './SidePanel/SidePanel.vue'
</script>

<template>
  <div
    flex="~ row items-stretch"
    h="[calc(100%-40px)]"
  >
    <SidePanel w="225px" min="w-225px" max="w-225px" />
    <ProjectOverview grow max="w-[calc(100%-225px)]" />
  </div>
</template>
