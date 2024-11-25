<script lang="ts" setup>
import { LicensePop, mainLangPop, ProjectCard } from '~/components/ProjectCard'
import { projectItems } from '~/core/main'
import { JeFrame, JeLine } from '~/jetv-ui'

import ProjectOverviewHeader from './ProjectOverviewHeader.vue'
</script>

<template>
  <JeFrame>
    <ProjectOverviewHeader />
    <JeLine mx-20px />
    <JeFrame
      m="x-15px y-5px" p="y-5px r-3px"
      grid="~ cols-1"
      overflow-y-auto overflow-x-auto
    >
      <ProjectCard
        v-for="(projectItem, index) in projectItems"
        :key="index"
        :project-item="projectItem"
      />

      <mainLangPop />
      <LicensePop />
    </JeFrame>
  </JeFrame>
</template>
