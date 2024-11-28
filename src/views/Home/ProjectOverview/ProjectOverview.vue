<script lang="ts" setup>
import { LicensePop, mainLangPop, ProjectCard } from '~/components/ProjectCard'
import { projectManager } from '~/core/main'
import { JeFrame, JeLine } from '~/jetv-ui'

import ProjectOverviewHeader from './ProjectOverviewHeader.vue'
</script>

<template>
  <JeFrame flex="~ col">
    <ProjectOverviewHeader />
    <JeLine mx-20px />
    <JeFrame
      m="x-15px y-5px" p="y-5px r-3px"
      flex="~ col" gap="10px"
      overflow-y-auto overflow-x-auto
    >
      <ProjectCard
        v-for="(projectItem, index) in projectManager.getProjects()"
        :key="index"
        :project-item="projectItem"
      />

      <mainLangPop />
      <LicensePop />
    </JeFrame>
  </JeFrame>
</template>
