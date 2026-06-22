<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiActionMenu from '~/components/ui/UiActionMenu.vue'
import type { LocalProject } from '~/constants/localProject'

import type { ProjectActionKey } from '../../types'

const props = defineProps<{
  project: LocalProject
  menuItems: UiActionMenuItem[]
  isOpening: boolean
  isTerminalOpening: boolean
  copyFeedback?: 'success' | 'error'
  actionButtonTabIndex: (project: LocalProject, action: ProjectActionKey) => number
  isProjectActionDisabled: (project: LocalProject, action: ProjectActionKey) => boolean
}>()

const emit = defineEmits<{
  ref: [projectId: number, element: unknown]
  open: [project: LocalProject]
  explorer: [project: LocalProject]
  terminal: [project: LocalProject]
  copy: [project: LocalProject]
  menuSelect: [project: LocalProject, action: string]
  keydown: [project: LocalProject, event: KeyboardEvent]
}>()

const { t } = useI18n()

const copyButtonTitle = computed(() => {
  if (props.copyFeedback === 'success')
    return t('app.home.actions.copied')
  if (props.copyFeedback === 'error')
    return t('app.home.actions.copy_failed')
  return t('app.home.actions.copy_path')
})

const copyButtonIcon = computed(() => {
  if (props.copyFeedback === 'success')
    return 'i-lucide:check'
  if (props.copyFeedback === 'error')
    return 'i-lucide:x'
  return 'i-lucide:copy'
})

const copyButtonClass = computed(() => ({
  'copy-success': props.copyFeedback === 'success',
  'copy-error': props.copyFeedback === 'error',
}))

const openProjectButtonTitle = computed(() =>
  props.isOpening
    ? t('app.home.actions.opening_project')
    : t('app.home.actions.open_project'),
)

const openProjectButtonAriaLabel = computed(() =>
  props.isOpening
    ? t('app.home.actions.opening_named', { name: props.project.name })
    : t('app.home.actions.open_named', { name: props.project.name }),
)

const openProjectButtonIcon = computed(() =>
  props.isOpening
    ? 'i-lucide:loader-circle animate-spin'
    : 'i-lucide:external-link',
)

const terminalButtonTitle = computed(() =>
  props.isTerminalOpening
    ? t('app.home.actions.opening_terminal')
    : t('app.home.actions.open_terminal'),
)

const terminalButtonAriaLabel = computed(() =>
  props.isTerminalOpening
    ? t('app.home.actions.opening_terminal_named', { name: props.project.name })
    : t('app.home.actions.open_terminal'),
)

const terminalButtonIcon = computed(() =>
  props.isTerminalOpening
    ? 'i-lucide:loader-circle animate-spin'
    : 'i-lucide:square-terminal',
)
</script>

<template>
  <div
    :ref="el => emit('ref', project.appendTime, el)"
    class="row-actions"
    shrink-0 flex items-center justify-end gap-3px
    role="toolbar"
    aria-orientation="horizontal"
    :aria-label="t('app.home.actions.project_actions', { name: project.name })"
    @keydown="emit('keydown', project, $event)"
  >
    <button
      class="action-button primary-action"
      :class="{ launching: isOpening }"
      size-23px border-0 rounded-4px p-0
      inline-flex items-center justify-center cursor-pointer
      bg-transparent color="$ui-muted-foreground"
      hover:bg="$ui-hover-background" hover:color="$ui-foreground"
      type="button"
      data-project-action="open"
      :title="openProjectButtonTitle"
      :aria-label="openProjectButtonAriaLabel"
      :aria-busy="isOpening"
      :disabled="!project.isExists"
      :tabindex="actionButtonTabIndex(project, 'open')"
      @click.stop="emit('open', project)"
    >
      <span size-14px :class="openProjectButtonIcon" />
    </button>
    <button
      class="action-button"
      size-23px border-0 rounded-4px p-0
      inline-flex items-center justify-center cursor-pointer
      bg-transparent color="$ui-muted-foreground"
      hover:bg="$ui-hover-background" hover:color="$ui-foreground"
      type="button"
      data-project-action="explorer"
      :title="t('app.home.actions.open_explorer')"
      :aria-label="t('app.home.actions.open_explorer')"
      :disabled="isProjectActionDisabled(project, 'explorer')"
      :tabindex="actionButtonTabIndex(project, 'explorer')"
      @click.stop="emit('explorer', project)"
    >
      <span size-14px i-lucide:folder />
    </button>
    <button
      class="action-button"
      :class="{ 'action-loading': isTerminalOpening }"
      size-23px border-0 rounded-4px p-0
      inline-flex items-center justify-center cursor-pointer
      bg-transparent color="$ui-muted-foreground"
      hover:bg="$ui-hover-background" hover:color="$ui-foreground"
      type="button"
      data-project-action="terminal"
      :title="terminalButtonTitle"
      :aria-label="terminalButtonAriaLabel"
      :aria-busy="isTerminalOpening"
      :disabled="!project.isExists"
      :tabindex="actionButtonTabIndex(project, 'terminal')"
      @click.stop="emit('terminal', project)"
    >
      <span size-14px :class="terminalButtonIcon" />
    </button>
    <button
      class="action-button copy-action"
      :class="copyButtonClass"
      size-23px border-0 rounded-4px p-0
      inline-flex items-center justify-center cursor-pointer
      bg-transparent color="$ui-muted-foreground"
      hover:bg="$ui-hover-background" hover:color="$ui-foreground"
      type="button"
      data-project-action="copy"
      :title="copyButtonTitle"
      :aria-label="copyButtonTitle"
      :tabindex="actionButtonTabIndex(project, 'copy')"
      @click.stop="emit('copy', project)"
    >
      <span size-14px :class="copyButtonIcon" />
    </button>
    <UiActionMenu
      :items="menuItems"
      :aria-label="t('app.home.actions.more')"
      @select="action => emit('menuSelect', project, action)"
    >
      <button
        class="action-button more-action"
        size-23px border-0 rounded-4px p-0
        inline-flex items-center justify-center cursor-pointer
        bg-transparent color="$ui-muted-foreground"
        hover:bg="$ui-hover-background" hover:color="$ui-foreground"
        type="button"
        data-project-action="more"
        :title="t('app.home.actions.more')"
        :aria-label="t('app.home.actions.more')"
        :tabindex="actionButtonTabIndex(project, 'more')"
        @click.stop
      >
        <span size-14px i-lucide:more-horizontal />
      </button>
    </UiActionMenu>
  </div>
</template>

<style lang="scss" scoped>
.action-button {
  &:disabled {
    @apply opacity-35 cursor-not-allowed;
  }

  &.primary-action {
    @apply [color:color-mix(in_srgb,var(--ui-primary)_58%,var(--ui-muted-foreground))];

    &:hover,
    &:focus-visible {
      @apply color-$ui-primary;
    }
  }

  &.launching {
    @apply color-$ui-primary cursor-progress;
  }

  &.action-loading {
    @apply color-$ui-foreground cursor-progress;
  }

  &.copy-success {
    @apply color-$green-5;
  }

  &.copy-error {
    @apply color-$red-5;
  }
}

@media (max-width: 560px) {
  .row-actions {
    @apply gap-2px;
  }

  .action-button {
    @apply size-22px;
  }

  .action-button:not(.primary-action):not(.copy-action):not(.more-action) {
    @apply hidden;
  }
}
</style>
