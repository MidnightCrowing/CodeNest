<script lang="ts" setup>
import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiScrollArea from '~/components/ui/UiScrollArea.vue'
import type { LocalProject } from '~/constants/localProject'

import type { ProjectActionKey } from '../types'
import ProjectCard from './ProjectCard.vue'

defineProps<{
  projects: LocalProject[]
  hasMoreProjects: boolean
  displayProjectPath: (path: string) => string
  projectMenuItems: (project: LocalProject) => UiActionMenuItem[]
  isProjectOpening: (project: LocalProject) => boolean
  isTerminalOpening: (project: LocalProject) => boolean
  copyFeedback: Record<number, 'success' | 'error'>
  actionButtonTabIndex: (project: LocalProject, action: ProjectActionKey) => number
  isProjectActionDisabled: (project: LocalProject, action: ProjectActionKey) => boolean
}>()

const emit = defineEmits<{
  scrollRef: [element: unknown]
  sentinelRef: [element: unknown]
  itemRef: [projectId: number, element: unknown]
  actionsRef: [projectId: number, element: unknown]
  open: [project: LocalProject]
  containerKeydown: [project: LocalProject, event: KeyboardEvent]
  actionsKeydown: [project: LocalProject, event: KeyboardEvent]
  showLanguage: [project: LocalProject, event: MouseEvent]
  openSource: [project: LocalProject]
  openExplorer: [project: LocalProject]
  openTerminal: [project: LocalProject]
  copyPath: [project: LocalProject]
  menuSelect: [project: LocalProject, action: string]
}>()
</script>

<template>
  <UiScrollArea :ref="element => emit('scrollRef', element)" min-h-0 flex-1>
    <div
      min-h-full p-12px grid gap-12px content-start
      class="cards-body"
    >
      <ProjectCard
        v-for="project in projects"
        :key="project.appendTime"
        :project="project"
        :display-path="displayProjectPath(project.path)"
        :menu-items="projectMenuItems(project)"
        :is-opening="isProjectOpening(project)"
        :is-terminal-opening="isTerminalOpening(project)"
        :copy-feedback="copyFeedback[project.appendTime]"
        :action-button-tab-index="actionButtonTabIndex"
        :is-project-action-disabled="isProjectActionDisabled"
        @item-ref="(id, element) => emit('itemRef', id, element)"
        @actions-ref="(id, element) => emit('actionsRef', id, element)"
        @open="emit('open', project)"
        @container-keydown="(p, event) => emit('containerKeydown', p, event)"
        @actions-keydown="(p, event) => emit('actionsKeydown', p, event)"
        @show-language="(p, event) => emit('showLanguage', p, event)"
        @open-source="emit('openSource', project)"
        @open-explorer="emit('openExplorer', project)"
        @open-terminal="emit('openTerminal', project)"
        @copy-path="emit('copyPath', project)"
        @menu-select="(p, action) => emit('menuSelect', p, action)"
      />
      <div
        v-if="hasMoreProjects"
        :ref="element => emit('sentinelRef', element)"
        h-1px col-span-full
        aria-hidden="true"
      />
    </div>
  </UiScrollArea>
</template>

<style lang="scss" scoped>
.cards-body {
  @apply grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))];
}
</style>
