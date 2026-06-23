<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiScrollArea from '~/components/ui/UiScrollArea.vue'
import type { LocalProject } from '~/constants/localProject'

import type { ProjectActionKey } from '../types'
import ProjectListRow from './ProjectListRow.vue'

defineProps<{
  projects: LocalProject[]
  hasMoreProjects: boolean
  locale: string
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

const { t } = useI18n()
</script>

<template>
  <div
    h-31px px-12px border-b text-11px uppercase
    grid items-center gap-9px
    tracking-0
    light:border="$gray-12" dark:border="$gray-4"
    light:color="$gray-7" dark:color="$gray-8"
    class="project-grid"
  >
    <span>{{ t('app.home.table.project') }}</span>
    <span>{{ t('app.home.table.language') }}</span>
    <span>{{ t('app.home.table.editor') }}</span>
    <span>{{ t('app.home.table.license') }}</span>
    <span>{{ t('app.home.table.last_opened') }}</span>
    <span>{{ t('app.home.table.actions') }}</span>
  </div>

  <UiScrollArea :ref="element => emit('scrollRef', element)" min-h-0 flex-1>
    <ProjectListRow
      v-for="project in projects"
      :key="project.appendTime"
      :project="project"
      :display-path="displayProjectPath(project.path)"
      :menu-items="projectMenuItems(project)"
      :is-opening="isProjectOpening(project)"
      :is-terminal-opening="isTerminalOpening(project)"
      :copy-feedback="copyFeedback[project.appendTime]"
      :locale="locale"
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
      h-1px
      aria-hidden="true"
    />
  </UiScrollArea>
</template>

<style lang="scss" scoped>
.project-grid {
  @apply grid-cols-[minmax(220px,1.7fr)_110px_140px_104px_122px_136px];
}

.project-grid > :nth-child(4) {
  @apply ml-8px;
}

@media (max-width: 1020px) {
  .project-grid {
    @apply grid-cols-[minmax(220px,1fr)_104px_140px_112px_136px];
  }

  .project-grid > :nth-child(5) {
    @apply hidden;
  }
}

@media (max-width: 760px) {
  .project-grid {
    @apply grid-cols-[minmax(210px,1fr)_136px];
  }

  .project-grid > :nth-child(2),
  .project-grid > :nth-child(3),
  .project-grid > :nth-child(4),
  .project-grid > :nth-child(5) {
    @apply hidden;
  }
}

@media (max-width: 560px) {
  .project-grid {
    @apply grid-cols-[minmax(180px,1fr)_84px];
  }
}
</style>
