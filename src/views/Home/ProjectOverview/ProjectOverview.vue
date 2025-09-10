<script lang="ts" setup>
import Fuse from 'fuse.js'
import { JeFrame, JeLine } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { LicensePop, mainLangPop, ProjectCard } from '~/components/ProjectCard'
import type { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'

import type { SidePanelActive } from '../types'
import ProjectOverviewHeader from './ProjectOverviewHeader.vue'

const props = defineProps<{
  activatedItem: SidePanelActive
}>()

const { t } = useI18n()
const projects = useProjectsStore()

const searchValue = ref('')

// 根据选择的 kind、temp 和 lang 获取项目列表
const projectsFiltered = computed(() => {
  const activatedItem = props.activatedItem

  // 匹配以 k- 开头的字符串
  if (activatedItem.startsWith('k-')) {
    const content = activatedItem.slice(2) // 去掉前面的 "k-"

    if (content === 'all') {
      return projects.allProjects
    }
    else {
      return projects.getProjectsByKind(content as ProjectKind)
    }
  }

  // 匹配 temp 字符串
  else if (activatedItem === 'temp') {
    return projects.tempProjects
  }

  // 匹配以 l- 开头的字符串
  else if (activatedItem.startsWith('l-')) {
    const content = activatedItem.slice(2) // 去掉前面的 "l-"

    // 如果有语言参数，返回指定语言的项目
    return projects.getProjectsByLang(content)
  }

  else {
    throw new Error(`Invalid activatedItem: ${props.activatedItem}`)
  }
})

// 过滤项目
const filteredProjects = computed(() => {
  let result = projectsFiltered.value

  if (searchValue.value) {
    // 根据搜索值过滤项目
    const fuse = new Fuse(result, {
      keys: ['name', 'group', 'path'], // 指定需要搜索的字段
      threshold: 0.5, // 模糊匹配的阈值（0 完全匹配，1 匹配宽松）
      shouldSort: true, // 是否按匹配度排序
    })

    // 根据搜索值进行模糊匹配
    result = fuse.search(searchValue.value).map(res => res.item)
  }

  return result
})

function handleDrop(event: DragEvent) {
  if (!event.dataTransfer) {
    console.error('dataTransfer is null')
    return
  }

  const draggedItemId = Number(event.dataTransfer.getData('text/plain'))
  const draggedItemIndex = filteredProjects.value.findIndex(
    item => item.appendTime === draggedItemId,
  )

  if (draggedItemIndex === -1) {
    console.error('Dropped item not found')
    return
  }

  const currentTarget = event.currentTarget as HTMLElement
  if (currentTarget && event.target) {
    const targetElement = event.target as Element
    const targetIndex = Array.from(currentTarget.children).indexOf(targetElement)

    if (targetIndex !== -1) {
      const draggedItem = filteredProjects.value.splice(draggedItemIndex, 1)[0]
      // 插入到目标位置
      filteredProjects.value.splice(targetIndex, 0, draggedItem)

      projects.saveProjects()
    }
  }
  else {
    console.error('event.currentTarget or event.target is null')
  }
}
</script>

<template>
  <JeFrame flex="~ col">
    <ProjectOverviewHeader v-model:search-value="searchValue" />
    <JeLine mx-20px />
    <JeFrame
      m="x-15px t-5px b-10px" p="y-5px r-3px"
      grow flex="~ col" gap="10px"
      overflow-auto
      @dragover.prevent
      @drop="handleDrop"
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
