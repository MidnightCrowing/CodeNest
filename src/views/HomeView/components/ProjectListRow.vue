<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiActionMenu from '~/components/ui/UiActionMenu.vue'
import type { LocalProject } from '~/constants/localProject'

import type { ProjectActionKey } from '../types'
import { formatLastOpened } from '../utils/projectFormatters'
import ProjectActions from './project/ProjectActions.vue'
import ProjectEditorChip from './project/ProjectEditorChip.vue'
import ProjectMeta from './project/ProjectMeta.vue'
import ProjectSource from './project/ProjectSource.vue'
import ProjectTitle from './project/ProjectTitle.vue'

defineProps<{
  project: LocalProject
  displayPath: string
  menuItems: UiActionMenuItem[]
  isOpening: boolean
  isTerminalOpening: boolean
  copyFeedback?: 'success' | 'error'
  locale: string
  actionButtonTabIndex: (project: LocalProject, action: ProjectActionKey) => number
  isProjectActionDisabled: (project: LocalProject, action: ProjectActionKey) => boolean
}>()

const emit = defineEmits<{
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
  <UiActionMenu
    mode="context"
    :items="menuItems"
    :aria-label="t('app.home.actions.more')"
    @select="action => emit('menuSelect', project, action)"
  >
    <div
      :ref="el => emit('itemRef', project.appendTime, el)"
      class="project-grid project-row"
      :class="{ missing: !project.isExists }"
      min-h-52px px-12px py-6px border-b cursor-pointer
      grid items-center gap-9px
      light:border="$gray-13" dark:border="$gray-3"
      hover:bg="$ui-hover-background" focus-visible:outline-none
      transition duration-120 ease-out
      focus-visible:shadow="[inset_0_0_0_2px_var(--ui-ring)]"
      role="button"
      :tabindex="project.isExists ? 0 : -1"
      :aria-disabled="!project.isExists"
      :aria-label="t('app.home.actions.open_named', { name: project.name })"
      aria-keyshortcuts="Enter Space Shift+F10 Control+I Meta+I Control+C Meta+C Delete Backspace"
      @click="emit('open', project)"
      @keydown="emit('containerKeydown', project, $event)"
    >
      <div min-w-0 flex flex-col gap-3px>
        <ProjectTitle :project="project" />
        <div truncate text-11px light:color="$gray-7" dark:color="$gray-8" :title="project.path">
          {{ displayPath }}
        </div>
        <ProjectSource :project="project" @open="emit('openSource', project)" />
      </div>

      <ProjectMeta
        :project="project"
        variant="language"
        @show-language="(p, event) => emit('showLanguage', p, event)"
      />
      <ProjectEditorChip :editor="project.defaultOpen" list-cell />
      <ProjectMeta :project="project" variant="license" />
      <span
        truncate text-11px light:color="$gray-7" dark:color="$gray-8"
        class="recent-cell"
        :class="{ muted: !project.lastOpenedAt }"
      >
        {{ formatLastOpened(project, locale, t) }}
      </span>
      <ProjectActions
        :project="project"
        :menu-items="menuItems"
        :is-opening="isOpening"
        :is-terminal-opening="isTerminalOpening"
        :copy-feedback="copyFeedback"
        :action-button-tab-index="actionButtonTabIndex"
        :is-project-action-disabled="isProjectActionDisabled"
        @ref="(id, element) => emit('actionsRef', id, element)"
        @open="emit('open', project)"
        @explorer="emit('openExplorer', project)"
        @terminal="emit('openTerminal', project)"
        @copy="emit('copyPath', project)"
        @menu-select="(p, action) => emit('menuSelect', p, action)"
        @keydown="(p, event) => emit('actionsKeydown', p, event)"
      />
    </div>
  </UiActionMenu>
</template>

<style lang="scss" scoped>
.project-grid {
  @apply grid-cols-[minmax(220px,1.7fr)_110px_140px_104px_122px_136px];
}

.project-grid > :nth-child(4) {
  @apply ml-8px;
}

.project-row {
  &.missing {
    @apply cursor-default opacity-78;
  }
}

.recent-cell.muted {
  @apply color-$ui-muted-foreground;
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
