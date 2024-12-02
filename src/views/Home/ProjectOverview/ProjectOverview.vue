<script lang="ts" setup>
import { JeFrame, JeLine } from '@jetv/ui'
import { useI18n } from 'vue-i18n'

import { LicensePop, mainLangPop, ProjectCard } from '~/components/ProjectCard'
import { ProjectKind } from '~/constants/localProject'
import { projectManager } from '~/core/main'

import ProjectOverviewHeader from './ProjectOverviewHeader.vue'

const props = defineProps<{
  activatedItem: string
}>()

const { t } = useI18n()

const searchValue = ref('')

// 根据激活的菜单项获取 kind (去除前缀 k-)
const kind = computed(() => {
  const kindMatch = props.activatedItem.match(/^k-(\w+)$/)
  return kindMatch ? kindMatch[1] : 'all'
})

// 根据激活的菜单项获取语言 (去除前缀 l-)
const lang = computed(() => {
  const langMatch = props.activatedItem.match(/^l-(.+)$/)
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

// 过滤项目
const filteredProjects = computed(() => {
  let result = projects.value

  if (searchValue.value) {
    // 根据搜索值过滤项目
    result = result.filter((project) => {
      const projectName = project.name.toLowerCase()
      const searchQuery = searchValue.value.toLowerCase()
      return projectName.includes(searchQuery)
    })
  }

  return result
})
</script>

<template>
  <JeFrame flex="~ col">
    <ProjectOverviewHeader v-model:search-value="searchValue" />
    <JeLine mx-20px />
    <JeFrame
      m="x-15px t-5px b-10px" p="y-5px r-3px"
      grow flex="~ col" gap="10px"
      overflow-auto
    >
      <!-- Empty -->
      <span
        v-if="filteredProjects.length === 0"
        text="default-semibold center secondary"
        p="5px t-150px"
      >
        {{ t('home.overview.empty_desc') }}
      </span>

      <TransitionGroup v-else name="list">
        <template v-for="projectItem in filteredProjects" :key="projectItem.appendTime">
          <ProjectCard
            :project-item="projectItem"
            shrink-0
          />
        </template>
      </TransitionGroup>

      <mainLangPop />
      <LicensePop />
    </JeFrame>
  </JeFrame>
</template>
