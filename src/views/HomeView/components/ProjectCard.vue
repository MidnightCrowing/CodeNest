<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiActionMenu from '~/components/ui/UiActionMenu.vue'
import type { LocalProject } from '~/constants/localProject'

import type { ProjectActionKey } from '../types'
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
    <article
      :ref="el => emit('itemRef', project.appendTime, el)"
      class="project-card"
      :class="{ missing: !project.isExists }"
      min-w-0 rounded-6px border p-12px cursor-pointer
      flex flex-col bg="$ui-control-background"
      hover:bg="$ui-hover-background" focus-visible:outline-none
      role="button"
      :tabindex="project.isExists ? 0 : -1"
      :aria-disabled="!project.isExists"
      :aria-label="t('app.home.actions.open_named', { name: project.name })"
      aria-keyshortcuts="Enter Space Shift+F10 Control+I Meta+I Control+C Meta+C Delete Backspace"
      @click="emit('open', project)"
      @keydown="emit('containerKeydown', project, $event)"
    >
      <header min-w-0 flex items-center gap-9px justify-between>
        <ProjectTitle :project="project" card />
      </header>

      <div
        my-9px truncate text-11px light:color="$gray-6" dark:color="$gray-8"
        :title="project.path"
      >
        {{ displayPath }}
      </div>

      <ProjectSource :project="project" card @open="emit('openSource', project)" />

      <div
        min-w-0 flex items-center gap-9px mt-auto
        flex-wrap
      >
        <ProjectMeta :project="project" @show-language="(p, event) => emit('showLanguage', p, event)" />
      </div>

      <footer
        min-w-0 items-center gap-9px mt-12px grid
        class="card-footer"
      >
        <ProjectEditorChip :editor="project.defaultOpen" />
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
      </footer>
    </article>
  </UiActionMenu>
</template>

<style lang="scss" scoped>
.project-card {
  @apply border-$ui-border shadow-$shadow-surface;
  @apply transition duration-120 ease-out;

  &:hover {
    @apply shadow-$shadow-surface-hover -translate-y-1px;
  }

  &:focus-visible {
    @apply shadow-[var(--shadow-focus),var(--shadow-surface-hover)];
  }

  &.missing {
    @apply cursor-default opacity-78 shadow-$shadow-surface transform-none;
  }
}

.card-footer {
  @apply grid-cols-[minmax(0,1fr)_max-content];

  :deep(.editor-chip) {
    @apply w-fit max-w-180px shrink justify-self-start;
  }

  :deep(.row-actions) {
    @apply opacity-0 pointer-events-none;
    @apply transition-opacity duration-120 ease-out;
  }
}

.project-card:hover,
.project-card:focus,
.project-card:focus-within {
  .card-footer :deep(.row-actions) {
    @apply opacity-100 pointer-events-auto;
  }
}
</style>
