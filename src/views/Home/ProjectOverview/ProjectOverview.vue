<script setup lang="ts">
import LanguagePop from '~/components/ProjectCard/LanguagePop/LanguagePop.vue'
import LicensePop from '~/components/ProjectCard/LicensePop/LicensePop.vue'
import ProjectCard from '~/components/ProjectCard/ProjectCard.vue'
import type { ProjectItem } from '~/components/ProjectCard/type'
import { License } from '~/constants/license'
import { ProjectKind } from '~/constants/projectKind'
import { JeFrame, JeLine } from '~/jetv-ui'

import ProjectOverviewHeader from './ProjectOverviewHeader.vue'

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

      <LanguagePop />
      <LicensePop />
    </JeFrame>
  </JeFrame>
</template>
