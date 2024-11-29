<script lang="ts" setup>
import { LicensePop, mainLangPop, ProjectCard } from '~/components/ProjectCard'
import { ProjectKind } from '~/constants/localProject'
import { projectManager } from '~/core/main'
import { JeFrame, JeLine } from '~/jetv-ui'

import ProjectOverviewHeader from './ProjectOverviewHeader.vue'

const props = defineProps<{
  activatedItem: string
}>()

// 根据激活的菜单项获取 kind (去除前缀 k-)
const kind = computed(() => {
  const kindMatch = props.activatedItem.match(/^k-(\w+)$/)
  return kindMatch ? kindMatch[1] : 'all'
})

// 根据激活的菜单项获取语言 (去除前缀 l-)
const lang = computed(() => {
  const langMatch = props.activatedItem.match(/^l-(\w+)$/)
  return langMatch ? langMatch[1] : ''
})

// 根据选择的 kind 和 lang 获取项目列表
const projects = computed(() => {
  if (kind.value === 'all') {
    return lang.value ? projectManager.getProjectsByLang(lang.value) : projectManager.getProjects()
  }
  else {
    const projectKindMap: Record<string, ProjectKind> = {
      mine: ProjectKind.MINE,
      fork: ProjectKind.FORK,
      clone: ProjectKind.CLONE,
      test: ProjectKind.TEST,
    }

    if (lang.value) {
      // 如果有语言参数，返回指定语言的项目
      return projectManager.getProjectsByLang(lang.value).filter(project =>
        projectManager.getProjectsByKind(projectKindMap[kind.value]).includes(project),
      )
    }
    else {
      // 没有语言参数，按 kind 获取项目
      return projectManager.getProjectsByKind(projectKindMap[kind.value])
    }
  }
})
</script>

<template>
  <JeFrame flex="~ col">
    <ProjectOverviewHeader />
    <JeLine mx-20px />
    <JeFrame
      m="x-15px y-5px" p="y-5px r-3px"
      flex="~ col" gap="10px"
      overflow-auto
    >
      <ProjectCard
        v-for="(projectItem, index) in projects"
        :key="`${kind}-${lang}-${index}`"
        :project-item="projectItem"
        shrink-0
      />

      <mainLangPop />
      <LicensePop />
    </JeFrame>
  </JeFrame>
</template>
