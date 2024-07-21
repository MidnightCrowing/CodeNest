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
    name: 'BewlyBewly',
    path: 'E:/Projects/BewlyBewly',
    kindInfo: {
      kind: ProjectKind.CLONE,
      from: 'BewlyBewly/BewlyBewly',
      url: 'https://github.com/BewlyBewly/BewlyBewly',
    },
    language: { text: 'SCSS', color: '#C6538C' },
    languagesGroup: [
      { text: 'Vue', color: '#41B883', percentage: 0.438 },
      { text: 'TypeScript', color: '#3178C6', percentage: 0.439 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.211 },
      { text: 'Other', color: '#E7E8E8', percentage: 0.002 },
    ],
    license: License.BOOST_1_0,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'BewlyBewly',
    path: 'E:/Projects/BewlyBewly',
    kindInfo: {
      kind: ProjectKind.FORK,
      url: 'https://github.com/BewlyBewly/BewlyBewly',
    },
    language: { text: 'Other', color: '#E7E8E8' },
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
    name: 'BewlyBewly/BewlyBewly',
    path: 'E:/Projects/BewlyBewly',
    kindInfo: {
      kind: ProjectKind.FORK,
    },
    language: { text: 'HTML', color: '#E34C26' },
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
  {
    name: 'Project1',
    path: 'E:/Projects/Project1',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.APACHE_2_0,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project2',
    path: 'E:/Projects/Project2',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.BSD_3_CLAUSE,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project3',
    path: 'E:/Projects/Project3',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.GPLV3,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project4',
    path: 'E:/Projects/Project4',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.MPL_2_0,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project5',
    path: 'E:/Projects/Project5',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.CC0_1_0,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project6',
    path: 'E:/Projects/Project6',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.WTFPL,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project7',
    path: 'E:/Projects/Project7',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.ISC,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project8',
    path: 'E:/Projects/Project8',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.UNLICENSE,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project9',
    path: 'E:/Projects/Project9',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.CECILL_B,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project10',
    path: 'E:/Projects/Project10',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.APACHE_1_1,
    openWith: 'Visual Studio Code',
  },
  {
    name: 'Project10',
    path: 'E:/Projects/Project10',
    kindInfo: { kind: ProjectKind.MINE },
    language: { text: 'TypeScript', color: '#3178C6' },
    languagesGroup: [
      { text: 'TypeScript', color: '#3178C6', percentage: 0.457 },
      { text: 'Vue', color: '#41B883', percentage: 0.399 },
      { text: 'SCSS', color: '#C6538C', percentage: 0.088 },
      { text: 'JavaScript', color: '#F1E05A', percentage: 0.041 },
      { text: 'HTML', color: '#E34C26', percentage: 0.015 },
    ],
    license: License.OTHER,
    openWith: 'Visual Studio Code',
  },
]
</script>

<template>
  <div bg="$bg-2">
    <Header />
    <hr hr m="x-16px">
    <main>
      <ProjectButton
        v-for="projectItem in projectItems"
        :key="projectItem"
        :project-item="projectItem"
      />
    </main>
  </div>
</template>

<style scoped lang="scss">
main {
  --uno: "h-[calc(100%-90px)]";
  --uno: "mx-15px my-5px py-5px pr-3px";

  // 滚动条设置
  --uno: "overflow-y-auto";
  --uno: "scrollbar:w-8px ";
  // --uno: "scrollbar-thumb:rounded-5px";
  --uno: "scrollbar-track:bg-transparent";
  --uno: "scrollbar-corner:bg-transparent";
  --uno: "scrollbar-thumb:bg-$scrollbar-thumb";
  --uno: "hover:scrollbar-thumb:bg-$scrollbar-thumb-hover";
}
</style>
