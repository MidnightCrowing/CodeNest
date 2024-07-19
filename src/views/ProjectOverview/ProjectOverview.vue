<script setup lang="ts">
import { License } from '~/constants/license'
import { ProjectKind } from '~/constants/projectKind'

import Header from './components/Header.vue'
import ProjectButton from './components/ProjectButton/ProjectButton.vue'
import type { ProjectItem } from './types'

const projectItems: ProjectItem[] = [
  {
    name: 'BewlyBewly',
    path: 'E:/Projects/BewlyBewly',
    kindInfo: {
      kind: ProjectKind.FORK,
      from: 'BewlyBewly/BewlyBewly',
      url: 'https://github.com/BewlyBewly/BewlyBewly',
    },
    language: { text: 'Vue', color: '#41B883' },
    languagesGroup: [
      { text: 'Vue', color: '#41B883', percentage: 0.438 },
      { text: 'TypeScript', color: '#3178C6', percentage: 0.439 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.211 },
      { text: 'Other', color: '#E7E8E8', percentage: 0.002 },
    ],
    license: License.MIT,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'CodeNest',
    path: 'E:/Projects/CodeNest',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.MIT,
    openWith: 'Visual Studio Code',
  },
]
</script>

<template>
  <div bg="$bg-2">
    <Header />
    <hr hr m="x-16px">
    <main m="x-15px y-5px" p="y-5px">
      <ProjectButton
        v-for="projectItem in projectItems"
        :key="projectItem"
        :project-item="projectItem"
      />
    </main>
  </div>
</template>

<style scoped lang="scss">

</style>
