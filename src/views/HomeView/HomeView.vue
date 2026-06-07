<script lang="ts" setup>
import { useLocalStorage } from '@vueuse/core'
import Fuse from 'fuse.js'
import { useI18n } from 'vue-i18n'

import mainLangPop from '~/components/LanguagePop/LanguagePop.vue'
import { showPop as showLanguagePop } from '~/components/LanguagePop/LanguagePopProvider'
import { showNoIdePathDialog } from '~/components/NoIdePathDialog'
import { showRemoveDialog } from '~/components/RemoveProjectDialog'
import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import UiActionMenu from '~/components/ui/UiActionMenu.vue'
import UiScrollArea from '~/components/ui/UiScrollArea.vue'
import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'
import { ThemeEnum, ViewEnum } from '~/constants/appEnums'
import { codeEditors } from '~/constants/codeEditor'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { addNewProjectsFromScanner } from '~/services/projectScannerService'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'
import {
  initializeNewProjectState,
  initializeUpdateProjectState,
} from '~/views/ProjectEditorView'

import LanguageFilterSelect from './LanguageFilterSelect.vue'

defineOptions({
  name: 'Home',
})

type KindFilter = ProjectKind | 'all'
type StatusFilter = 'all' | 'available' | 'missing' | 'temporary'
type SortKey = 'recent' | 'name' | 'language' | 'group'
type LayoutMode = 'list' | 'grid'

const MIN_SYNC_BUSY_MS = 280

interface FilterOption<T extends string> {
  value: T
  label: string
  color?: string
  count?: number
}

const projectsStore = useProjectsStore()
const settingsStore = useSettingsStore()
const activatedView = inject('activatedView') as Ref<ViewEnum>
const { locale, t } = useI18n()

const searchValue = ref('')
const kindFilter = ref<KindFilter>('all')
const statusFilter = ref<StatusFilter>('all')
const languageFilter = ref('all')
const groupFilter = ref('all')
const sortKey = ref<SortKey>('recent')
const layoutMode = useLocalStorage<LayoutMode>('codenest:home-layout', 'list')
const syncing = ref(false)
const copyFeedback = ref<Record<number, 'success' | 'error'>>({})
const copyFeedbackTimers = new Map<number, number>()

const totalProjects = computed(() => projectsStore.allProjects.length)
const availableProjects = computed(() => projectsStore.allProjects.filter(project => project.isExists).length)
const missingProjects = computed(() => projectsStore.allProjects.filter(project => !project.isExists).length)
const temporaryProjects = computed(() => projectsStore.tempProjects.length)

const kindOptions = computed<Array<FilterOption<KindFilter>>>(() => [
  { value: 'all', label: t('app.home.filters.all_projects'), count: totalProjects.value },
  { value: ProjectKind.MINE, label: t('app.project_kind.mine'), count: countByKind(ProjectKind.MINE) },
  { value: ProjectKind.FORK, label: t('app.project_kind.forks'), count: countByKind(ProjectKind.FORK) },
  { value: ProjectKind.CLONE, label: t('app.project_kind.clones'), count: countByKind(ProjectKind.CLONE) },
])

const statusOptions = computed<Array<FilterOption<StatusFilter>>>(() => [
  { value: 'all', label: t('app.home.filters.all_status'), count: totalProjects.value },
  { value: 'available', label: t('app.home.filters.available'), count: availableProjects.value },
  { value: 'missing', label: t('app.home.filters.missing_path'), count: missingProjects.value },
  { value: 'temporary', label: t('app.home.filters.temporary'), count: temporaryProjects.value },
])

const sortOptions = computed<Array<FilterOption<SortKey>>>(() => [
  { value: 'recent', label: t('app.home.sort.recent') },
  { value: 'name', label: t('app.home.sort.name') },
  { value: 'language', label: t('app.home.sort.language') },
  { value: 'group', label: t('app.home.sort.group') },
])

const layoutOptions = computed<Array<{ value: LayoutMode, label: string, icon: string }>>(() => [
  { value: 'list', label: t('app.home.layout.list'), icon: 'i-lucide:list' },
  { value: 'grid', label: t('app.home.layout.grid'), icon: 'i-lucide:layout-grid' },
])

const languages = computed(() =>
  [...projectsStore.mainLangSummary].sort((a, b) =>
    b.count - a.count || a.text.localeCompare(b.text),
  ),
)

const languageOptions = computed(() => [
  { value: 'all', label: t('app.home.filters.all_languages'), count: totalProjects.value },
  ...languages.value.map(language => ({
    value: language.text,
    label: language.text,
    color: language.color,
    count: language.count,
  })),
])

const groupOptions = computed(() => [
  { value: 'all', label: t('app.home.filters.all_groups'), count: totalProjects.value },
  { value: '__ungrouped__', label: t('app.home.filters.no_group'), count: projectsStore.allProjects.filter(project => !project.group).length },
  ...projectsStore.allGroups.map(group => ({
    value: group,
    label: group,
    count: projectsStore.allProjects.filter(project => project.group === group).length,
  })),
])

const filteredProjects = computed(() => {
  let result = projectsStore.allProjects

  if (kindFilter.value !== 'all') {
    result = result.filter(project => project.kind === kindFilter.value)
  }
  if (statusFilter.value === 'available') {
    result = result.filter(project => project.isExists)
  }
  if (statusFilter.value === 'missing') {
    result = result.filter(project => !project.isExists)
  }
  if (statusFilter.value === 'temporary') {
    result = result.filter(project => project.isTemporary)
  }
  if (languageFilter.value !== 'all') {
    result = result.filter(project => project.mainLang === languageFilter.value)
  }
  if (groupFilter.value === '__ungrouped__') {
    result = result.filter(project => !project.group)
  }
  else if (groupFilter.value !== 'all') {
    result = result.filter(project => project.group === groupFilter.value)
  }

  const query = searchValue.value.trim()
  if (query) {
    result = new Fuse(result, {
      keys: ['name', 'group', 'path', 'mainLang', 'defaultOpen'],
      threshold: 0.35,
      shouldSort: true,
    }).search(query).map(match => match.item)
  }

  return [...result].sort(compareProjects)
})

const activeFilterCount = computed(() =>
  Number(!!searchValue.value.trim())
  + Number(kindFilter.value !== 'all')
  + Number(statusFilter.value !== 'all')
  + Number(languageFilter.value !== 'all')
  + Number(groupFilter.value !== 'all'),
)

function projectMenuItems(project: LocalProject): UiActionMenuItem[] {
  return [
    {
      id: 'open',
      label: t('app.home.actions.open_project'),
      disabled: !project.isExists,
    },
    {
      id: 'explorer',
      label: t('app.home.actions.open_explorer'),
      disabled: !project.isExists,
      separatorBefore: true,
    },
    {
      id: 'terminal',
      label: t('app.home.actions.open_terminal'),
      disabled: !project.isExists,
    },
    {
      id: 'copy',
      label: t('app.home.actions.copy_path'),
    },
    {
      id: 'edit',
      label: t('app.home.actions.edit'),
      separatorBefore: true,
    },
    {
      id: 'pin',
      label: pinButtonTitle(project),
      icon: pinButtonIcon(project),
    },
    {
      id: 'remove',
      label: t('app.home.actions.remove'),
      icon: 'i-lucide:trash-2',
      danger: true,
      separatorBefore: true,
    },
  ]
}

function compareProjects(a: LocalProject, b: LocalProject) {
  if (!!a.isPinned !== !!b.isPinned)
    return a.isPinned ? -1 : 1

  switch (sortKey.value) {
    case 'name':
      return a.name.localeCompare(b.name)
    case 'language':
      return (a.mainLang || '').localeCompare(b.mainLang || '') || a.name.localeCompare(b.name)
    case 'group':
      return (a.group || '').localeCompare(b.group || '') || a.name.localeCompare(b.name)
    case 'recent':
    default:
      return b.appendTime - a.appendTime
  }
}

function addProject() {
  initializeNewProjectState()
  activatedView.value = ViewEnum.ProjectEditor
}

function editProject(project: LocalProject) {
  initializeUpdateProjectState(project)
  activatedView.value = ViewEnum.ProjectEditor
}

async function openProject(project: LocalProject) {
  if (!project.isExists) {
    return
  }

  const launchConfig = project.defaultOpen ? settingsStore.getEditorLaunchConfig(project.defaultOpen) : null
  if (!launchConfig?.command) {
    showNoIdePathDialog()
    return
  }

  try {
    await window.api.openProject(launchConfig.command, project.path, launchConfig.openInTerminal)
    await projectsStore.moveProjectToTopByTime(project.appendTime)
  }
  catch (error) {
    console.error('Failed to open project:', error)
    showNoIdePathDialog()
  }
}

async function copyProjectPath(project: LocalProject) {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API is not available')
    }

    await navigator.clipboard.writeText(project.path)
    setCopyFeedback(project.appendTime, 'success')
  }
  catch (error) {
    console.error('Failed to copy project path:', error)
    setCopyFeedback(project.appendTime, 'error')
  }
}

function setCopyFeedback(projectId: number, status: 'success' | 'error') {
  const activeTimer = copyFeedbackTimers.get(projectId)
  if (activeTimer) {
    window.clearTimeout(activeTimer)
  }

  copyFeedback.value = {
    ...copyFeedback.value,
    [projectId]: status,
  }

  const timer = window.setTimeout(() => {
    const { [projectId]: _removed, ...rest } = copyFeedback.value
    copyFeedback.value = rest
    copyFeedbackTimers.delete(projectId)
  }, 1400)

  copyFeedbackTimers.set(projectId, timer)
}

function copyButtonTitle(project: LocalProject) {
  const status = copyFeedback.value[project.appendTime]
  if (status === 'success')
    return t('app.home.actions.copied')
  if (status === 'error')
    return t('app.home.actions.copy_failed')
  return t('app.home.actions.copy_path')
}

function copyButtonIcon(project: LocalProject) {
  const status = copyFeedback.value[project.appendTime]
  if (status === 'success')
    return 'i-lucide:check'
  if (status === 'error')
    return 'i-lucide:x'
  return 'i-lucide:copy'
}

function copyButtonClass(project: LocalProject) {
  const status = copyFeedback.value[project.appendTime]
  return {
    'copy-success': status === 'success',
    'copy-error': status === 'error',
  }
}

function pinButtonTitle(project: LocalProject) {
  return project.isPinned
    ? t('app.home.actions.unpin')
    : t('app.home.actions.pin')
}

function pinButtonIcon(project: LocalProject) {
  return project.isPinned
    ? 'i-lucide:pin-off'
    : 'i-lucide:pin'
}

async function toggleProjectPinned(project: LocalProject) {
  await projectsStore.toggleProjectPinned(project.appendTime)
}

function handleProjectMenuSelect(project: LocalProject, action: string) {
  switch (action) {
    case 'pin':
      void toggleProjectPinned(project)
      break
    case 'open':
      void openProject(project)
      break
    case 'explorer':
      openInExplorer(project)
      break
    case 'terminal':
      openInTerminal(project)
      break
    case 'copy':
      void copyProjectPath(project)
      break
    case 'edit':
      editProject(project)
      break
    case 'remove':
      showRemoveDialog(project)
      break
  }
}

onBeforeUnmount(() => {
  copyFeedbackTimers.forEach(timer => window.clearTimeout(timer))
  copyFeedbackTimers.clear()
})

function openInExplorer(project: LocalProject) {
  window.api.openInExplorer(project.path)
}

function openInTerminal(project: LocalProject) {
  window.api.openInTerminal(project.path)
}

async function syncProjects() {
  if (!settingsStore.scannerEnabled)
    return

  const startedAt = performance.now()
  syncing.value = true
  try {
    await projectsStore.refreshProjectExistence()
    await addNewProjectsFromScanner()
  }
  finally {
    const elapsed = performance.now() - startedAt
    if (elapsed < MIN_SYNC_BUSY_MS) {
      await new Promise(resolve => setTimeout(resolve, MIN_SYNC_BUSY_MS - elapsed))
    }
    syncing.value = false
  }
}

function clearFilters() {
  searchValue.value = ''
  kindFilter.value = 'all'
  statusFilter.value = 'all'
  languageFilter.value = 'all'
  groupFilter.value = 'all'
}

function clearSearch() {
  searchValue.value = ''
}

function showLanguage(project: LocalProject, event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  showLanguagePop(project, rect.top + window.scrollY - 3, rect.left + window.scrollX - 5)
}

function openSettings() {
  activatedView.value = ViewEnum.Settings
}

function kindLabel(kind: ProjectKind) {
  switch (kind) {
    case ProjectKind.FORK:
      return t('app.project_kind.fork')
    case ProjectKind.CLONE:
      return t('app.project_kind.clone')
    case ProjectKind.MINE:
    default:
      return t('app.project_kind.mine')
  }
}

function countByKind(kind: ProjectKind) {
  return projectsStore.allProjects.filter(project => project.kind === kind).length
}

function kindClass(kind: ProjectKind) {
  switch (kind) {
    case ProjectKind.FORK:
      return 'kind-fork'
    case ProjectKind.CLONE:
      return 'kind-clone'
    case ProjectKind.MINE:
    default:
      return 'kind-mine'
  }
}

function shortLicense(license?: LicenseEnum) {
  if (!license || license === LicenseEnum.NONE)
    return t('app.license.none')
  if (license === LicenseEnum.MIT)
    return 'MIT'
  if (license === LicenseEnum.APACHE_2_0)
    return 'Apache-2.0'
  if (license === LicenseEnum.GPLV3)
    return 'GPL-3.0'
  if (license === LicenseEnum.GPLV2)
    return 'GPL-2.0'
  if (license === LicenseEnum.OTHER)
    return t('app.license.other')
  return license.replace(' License', '').replace('GNU ', '')
}

function editorIconClasses(editor?: keyof typeof codeEditors | null) {
  if (!editor)
    return []
  const option = codeEditors[editor]
  return ['ide-icon', option?.icon, { 'monochrome-editor-icon': option?.monochromeIcon }]
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function updateLayoutMode(value: string) {
  layoutMode.value = value as LayoutMode
}
</script>

<template>
  <main class="workspace-shell" :class="{ 'theme-dark': settingsStore.theme === ThemeEnum.Dark }">
    <section class="workspace-topbar">
      <div class="title-block">
        <div class="title-row">
          <h1>
            {{ t('app.home.title') }}
            <span class="count-badge">{{ totalProjects }}</span>
          </h1>
          <button class="icon-button title-settings" type="button" :title="t('app.settings.title')" :aria-label="t('app.settings.title')" @click="openSettings">
            <span class="i-lucide:settings" />
          </button>
        </div>
      </div>

      <div class="topbar-actions">
        <button v-if="settingsStore.scannerEnabled" class="ghost-button" type="button" :disabled="syncing" @click="syncProjects">
          <span class="i-lucide:refresh-cw" :class="{ spinning: syncing }" />
          {{ syncing ? t('app.home.syncing') : t('app.home.sync') }}
        </button>
        <button class="primary-button" type="button" @click="addProject">
          <span class="i-lucide:plus" />
          {{ t('app.home.add_project') }}
        </button>
      </div>
    </section>

    <section class="filter-bar">
      <div class="search-box">
        <span class="i-lucide:search" />
        <input
          v-model="searchValue"
          :aria-label="t('app.home.search_placeholder')"
          :placeholder="t('app.home.search_placeholder')"
          spellcheck="false"
        >
        <button
          v-if="searchValue"
          class="search-clear-button"
          type="button"
          :title="t('app.common.clear')"
          :aria-label="t('app.common.clear')"
          @click="clearSearch"
        >
          <span class="i-lucide:x" />
        </button>
      </div>

      <UiSelect
        v-model="kindFilter"
        :options="kindOptions"
        :placeholder="t('app.home.filters.kind')"
        :aria-label="t('app.home.filters.kind')"
        min-width="128px"
      />

      <UiSelect
        v-model="statusFilter"
        :options="statusOptions"
        :placeholder="t('app.home.filters.status')"
        :aria-label="t('app.home.filters.status')"
        min-width="128px"
      />

      <LanguageFilterSelect
        v-model="languageFilter"
        :options="languageOptions"
        :placeholder="t('app.home.filters.language')"
        :aria-label="t('app.home.filters.language')"
        min-width="150px"
        content-width="210px"
      />

      <UiSelect
        v-model="groupFilter"
        :options="groupOptions"
        :placeholder="t('app.home.filters.group')"
        :aria-label="t('app.home.filters.group')"
        min-width="128px"
        content-width="210px"
      />

      <UiSelect
        v-model="sortKey"
        :options="sortOptions"
        :placeholder="t('app.home.filters.sort')"
        :aria-label="t('app.home.filters.sort')"
        min-width="122px"
        content-width="170px"
      />

      <button v-if="activeFilterCount" class="clear-button" type="button" @click="clearFilters">
        {{ t('app.home.clear_count', { count: activeFilterCount }) }}
      </button>

      <UiSegmentedControl
        class="layout-switch"
        :model-value="layoutMode"
        :options="layoutOptions"
        :aria-label="t('app.home.layout.label')"
        @update:model-value="updateLayoutMode"
      />
    </section>

    <section class="project-table" :class="`layout-${layoutMode}`" :aria-label="t('app.home.project_list')">
      <div v-if="layoutMode === 'list'" class="project-grid table-head">
        <span>{{ t('app.home.table.project') }}</span>
        <span>{{ t('app.home.table.kind') }}</span>
        <span>{{ t('app.home.table.language') }}</span>
        <span>{{ t('app.home.table.license') }}</span>
        <span>{{ t('app.home.table.updated') }}</span>
        <span>{{ t('app.home.table.actions') }}</span>
      </div>

      <div v-if="filteredProjects.length === 0" class="empty-state">
        <strong>{{ t('app.home.empty.title') }}</strong>
        <span>{{ t('app.home.empty.desc') }}</span>
      </div>

      <UiScrollArea v-else-if="layoutMode === 'list'" class="table-body">
        <UiActionMenu
          v-for="project in filteredProjects"
          :key="project.appendTime"
          mode="context"
          :items="projectMenuItems(project)"
          :aria-label="t('app.home.actions.more')"
          @select="action => handleProjectMenuSelect(project, action)"
        >
          <div
            class="project-grid project-row"
            :class="{ missing: !project.isExists }"
            tabindex="0"
            @click="openProject(project)"
            @keydown.enter="openProject(project)"
            @keydown.space.prevent="openProject(project)"
          >
            <div class="project-main">
              <div class="project-title-line">
                <span class="project-title">
                  <span v-if="project.isPinned" class="pinned-marker i-lucide:pin" />
                  <span v-if="project.group" class="project-group-prefix">{{ project.group }}/</span><span class="project-name">{{ project.name }}</span>
                </span>
                <span class="editor-chip">
                  <span :class="editorIconClasses(project.defaultOpen)" />
                  <span class="editor-chip-label">{{ codeEditors[project.defaultOpen]?.label || t('app.common.no_editor') }}</span>
                </span>
              </div>
              <div class="project-path" :title="project.path">
                {{ project.path }}
              </div>
              <div v-if="project.fromUrl || project.fromName" class="project-source">
                {{ project.kind === ProjectKind.FORK ? t('app.home.source.forked_from') : t('app.home.source.cloned_from') }}
                {{ project.fromName || project.fromUrl }}
              </div>
            </div>

            <span class="kind-pill" :class="kindClass(project.kind)">
              {{ kindLabel(project.kind) }}
            </span>
            <button class="inline-pill" type="button" @click.stop="showLanguage(project, $event)">
              <span class="color-dot" :style="{ background: project.mainLangColor || '#b8b8b8' }" />
              {{ project.mainLang || t('app.common.unknown') }}
            </button>
            <span
              v-if="project.license && project.license !== LicenseEnum.NONE"
              class="license-cell"
            >
              {{ shortLicense(project.license) }}
            </span>
            <span v-else class="license-cell muted">{{ t('app.license.none') }}</span>
            <span class="updated-cell">{{ formatTime(project.appendTime) }}</span>

            <div class="row-actions">
              <button
                class="icon-button primary-action"
                type="button"
                :title="t('app.home.actions.open_project')"
                :aria-label="t('app.home.actions.open_project')"
                :disabled="!project.isExists"
                @click.stop="openProject(project)"
              >
                <span class="i-lucide:external-link" />
              </button>
              <button
                class="icon-button"
                type="button"
                :title="t('app.home.actions.open_explorer')"
                :aria-label="t('app.home.actions.open_explorer')"
                :disabled="!project.isExists"
                @click.stop="openInExplorer(project)"
              >
                <span class="i-lucide:folder" />
              </button>
              <button
                class="icon-button"
                type="button"
                :title="t('app.home.actions.open_terminal')"
                :aria-label="t('app.home.actions.open_terminal')"
                :disabled="!project.isExists"
                @click.stop="openInTerminal(project)"
              >
                <span class="i-lucide:square-terminal" />
              </button>
              <button
                class="icon-button copy-action"
                :class="copyButtonClass(project)"
                type="button"
                :title="copyButtonTitle(project)"
                :aria-label="copyButtonTitle(project)"
                @click.stop="copyProjectPath(project)"
              >
                <span :class="copyButtonIcon(project)" />
              </button>
              <UiActionMenu
                :items="projectMenuItems(project)"
                :aria-label="t('app.home.actions.more')"
                @select="action => handleProjectMenuSelect(project, action)"
              >
                <button
                  class="icon-button more-action"
                  type="button"
                  :title="t('app.home.actions.more')"
                  :aria-label="t('app.home.actions.more')"
                  @click.stop
                >
                  <span class="i-lucide:more-horizontal" />
                </button>
              </UiActionMenu>
            </div>
          </div>
        </UiActionMenu>
      </UiScrollArea>

      <UiScrollArea v-else class="cards-scroll">
        <div class="cards-body">
          <UiActionMenu
            v-for="project in filteredProjects"
            :key="project.appendTime"
            mode="context"
            :items="projectMenuItems(project)"
            :aria-label="t('app.home.actions.more')"
            @select="action => handleProjectMenuSelect(project, action)"
          >
            <article
              class="project-card"
              :class="{ missing: !project.isExists }"
              tabindex="0"
              @click="openProject(project)"
              @keydown.enter="openProject(project)"
              @keydown.space.prevent="openProject(project)"
            >
              <header class="card-header">
                <div class="card-title">
                  <strong>
                    <span v-if="project.isPinned" class="pinned-marker i-lucide:pin" />
                    <span v-if="project.group" class="project-group-prefix">{{ project.group }}/</span>{{ project.name }}
                  </strong>
                </div>
                <span class="kind-pill" :class="kindClass(project.kind)">
                  {{ kindLabel(project.kind) }}
                </span>
              </header>

              <div class="card-path" :title="project.path">
                {{ project.path }}
              </div>

              <div class="card-meta">
                <button class="inline-pill" type="button" @click.stop="showLanguage(project, $event)">
                  <span class="color-dot" :style="{ background: project.mainLangColor || '#b8b8b8' }" />
                  {{ project.mainLang || t('app.common.unknown') }}
                </button>
                <span
                  v-if="project.license && project.license !== LicenseEnum.NONE"
                  class="license-cell"
                >
                  {{ shortLicense(project.license) }}
                </span>
                <span v-else class="license-cell muted">{{ t('app.license.none') }}</span>
              </div>

              <footer class="card-footer">
                <span class="editor-chip">
                  <span :class="editorIconClasses(project.defaultOpen)" />
                  <span class="editor-chip-label">{{ codeEditors[project.defaultOpen]?.label || t('app.common.no_editor') }}</span>
                </span>
                <div class="row-actions">
                  <button
                    class="icon-button primary-action"
                    type="button"
                    :title="t('app.home.actions.open_project')"
                    :aria-label="t('app.home.actions.open_project')"
                    :disabled="!project.isExists"
                    @click.stop="openProject(project)"
                  >
                    <span class="i-lucide:external-link" />
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    :title="t('app.home.actions.open_explorer')"
                    :aria-label="t('app.home.actions.open_explorer')"
                    :disabled="!project.isExists"
                    @click.stop="openInExplorer(project)"
                  >
                    <span class="i-lucide:folder" />
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    :title="t('app.home.actions.open_terminal')"
                    :aria-label="t('app.home.actions.open_terminal')"
                    :disabled="!project.isExists"
                    @click.stop="openInTerminal(project)"
                  >
                    <span class="i-lucide:square-terminal" />
                  </button>
                  <button
                    class="icon-button copy-action"
                    :class="copyButtonClass(project)"
                    type="button"
                    :title="copyButtonTitle(project)"
                    :aria-label="copyButtonTitle(project)"
                    @click.stop="copyProjectPath(project)"
                  >
                    <span :class="copyButtonIcon(project)" />
                  </button>
                  <UiActionMenu
                    :items="projectMenuItems(project)"
                    :aria-label="t('app.home.actions.more')"
                    @select="action => handleProjectMenuSelect(project, action)"
                  >
                    <button
                      class="icon-button more-action"
                      type="button"
                      :title="t('app.home.actions.more')"
                      :aria-label="t('app.home.actions.more')"
                      @click.stop
                    >
                      <span class="i-lucide:more-horizontal" />
                    </button>
                  </UiActionMenu>
                </div>
              </footer>
            </article>
          </UiActionMenu>
        </div>
      </UiScrollArea>
    </section>

    <mainLangPop />
  </main>
</template>

<style lang="scss" scoped>
.workspace-shell {
  @apply size-full overflow-hidden flex flex-col;
  @apply bg-$ui-page-background;
}

.workspace-topbar {
  @apply shrink-0 flex items-center justify-between gap-12px;
  @apply px-14px pt-10px pb-7px;
}

.title-block {
  @apply min-w-0 shrink-0 flex flex-col gap-1px;

  h1 {
    @apply m-0 inline-flex items-center gap-7px text-17px font-650 lh-21px;
  }
}

.title-row {
  @apply min-w-0 flex items-center gap-6px;
}

.topbar-actions {
  @apply shrink-0 flex items-center gap-7px;
}

.primary-button,
.ghost-button,
.clear-button {
  @apply h-28px border-0 rounded-5px px-9px;
  @apply inline-flex items-center gap-6px whitespace-nowrap;
  @apply text-12px font-560 cursor-pointer;
}

.primary-button {
  @apply bg-$ui-primary color-$ui-primary-foreground;
  @apply hover:bg-$ui-primary-hover active:bg-$ui-primary-active;

  > span {
    @apply color-$ui-primary-foreground;
  }
}

.ghost-button {
  @apply bg-$ui-surface-background color-$ui-foreground;
  @apply hover:bg-$ui-hover-background;
}

.ghost-button:disabled,
.primary-button:disabled {
  @apply opacity-55 cursor-not-allowed;
}

.filter-bar {
  @apply shrink-0 flex flex-wrap items-center gap-7px px-14px pb-7px;
}

.search-box {
  @apply h-30px min-w-220px flex-1 rounded-md border;
  @apply flex items-center gap-7px px-9px;
  border-style: solid;
  border-color: var(--ui-input);
  @apply bg-$ui-control-background color-$ui-foreground;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  &:focus-within {
    border-color: var(--ui-ring);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-ring), transparent 78%);
  }

  input {
    @apply min-w-0 flex-1 border-0 bg-transparent outline-none;
    @apply text-12px;
    appearance: none;
    border-style: solid;
    color: var(--ui-foreground);

    &::placeholder {
      color: var(--ui-muted-foreground);
    }
  }
}

.search-clear-button {
  @apply size-18px shrink-0 rounded-full border-0 p-0;
  @apply inline-flex items-center justify-center cursor-pointer text-11px;
  @apply bg-$ui-hover-background color-$ui-muted-foreground;
  @apply hover:color-$ui-foreground;
}

.count-badge {
  @apply shrink-0 size-18px rounded-full px-0;
  @apply inline-flex items-center justify-center;
  @apply text-11px font-650 bg-$ui-hover-background color-$ui-muted-foreground;
}

.spinning {
  animation: spin-sync 0.8s linear infinite;
}

@keyframes spin-sync {
  to {
    transform: rotate(360deg);
  }
}

.clear-button {
  @apply bg-$ui-control-background color-$ui-muted-foreground;
  @apply hover:bg-$ui-hover-background hover:color-$ui-foreground;
}

.project-table {
  @apply min-h-0 mx-14px mb-14px flex-1 overflow-hidden rounded-6px flex flex-col;
  @apply bg-$ui-surface-background;
}

.project-grid {
  @apply grid items-center gap-9px;
  grid-template-columns: minmax(220px, 1.7fr) 76px 110px 104px 122px 160px;
}

.table-head {
  @apply h-31px px-10px border-b text-11px uppercase tracking-0;
  @apply light:border-$gray-12 dark:border-$gray-4;
  @apply light:color-$gray-7 dark:color-$gray-8;
}

.table-body {
  @apply min-h-0 flex-1;
}

.project-row {
  @apply min-h-52px px-10px py-6px border-b cursor-pointer;
  @apply light:border-$gray-13 dark:border-$gray-3;
  @apply hover:bg-$ui-hover-background;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-$blue-5;

  &.missing {
    @apply opacity-78;
  }
}

.project-main {
  @apply min-w-0 flex flex-col gap-3px;
}

.project-title-line {
  @apply min-w-0 flex items-center gap-7px;
}

.project-title {
  @apply min-w-0 flex items-center truncate;
}

.project-group-prefix {
  @apply shrink-0 text-12px font-600 light:color-$gray-7 dark:color-$gray-8;
}

.project-name {
  @apply min-w-0 truncate text-13px font-620 light:color-$gray-1 dark:color-$gray-13;
}

.pinned-marker {
  @apply mr-4px shrink-0 text-11px color-$ui-primary;
}

.project-path,
.project-source,
.updated-cell {
  @apply truncate text-11px light:color-$gray-7 dark:color-$gray-8;
}

.editor-chip {
  @apply min-w-0 w-fit shrink-0 max-w-180px rounded-4px px-5px py-2px;
  @apply inline-flex items-center gap-4px text-11px;
  @apply bg-$ui-hover-background;

  > span:first-child {
    @apply shrink-0;
  }
}

.editor-chip-label {
  @apply min-w-0 truncate;
}

.inline-pill,
.kind-pill,
.license-cell {
  @apply min-w-0 h-23px rounded-4px px-7px border-0;
  @apply inline-flex items-center gap-5px truncate text-11px;
  @apply bg-$ui-control-background color-$ui-foreground;
}

.inline-pill {
  @apply cursor-pointer hover:bg-$ui-hover-background;
}

.license-cell.muted {
  @apply light:color-$gray-8 dark:color-$gray-7;
}

.color-dot {
  @apply size-8px rounded-full shrink-0;
}

.kind-mine {
  @apply [--kind-color:var(--blue-5)];
  @apply [--kind-bg-light-strength:13%] [--kind-bg-dark-strength:18%];
  @apply [--kind-text-light:var(--blue-5)] [--kind-text-dark:var(--blue-8)];
}

.kind-fork {
  @apply [--kind-color:var(--purple-5)];
  @apply [--kind-bg-light-strength:14%] [--kind-bg-dark-strength:20%];
  @apply [--kind-text-light:color-mix(in_srgb,var(--purple-5)_92%,var(--gray-1))];
  @apply [--kind-text-dark:color-mix(in_srgb,var(--purple-8)_86%,var(--gray-1))];
}

.kind-clone {
  @apply [--kind-color:var(--yellow-5)] [--kind-bg-dark-color:var(--yellow-3)] [--kind-bg-dark-base:var(--gray-1)];
  @apply [--kind-bg-light-strength:27%] [--kind-bg-dark-strength:30%];
  @apply [--kind-text-light:color-mix(in_srgb,var(--yellow-2)_96%,var(--gray-1))];
  @apply [--kind-text-dark:color-mix(in_srgb,var(--yellow-5)_80%,var(--gray-1))];
}

.kind-pill {
  @apply [background:color-mix(in_srgb,var(--kind-color)_var(--kind-bg-light-strength),var(--ui-surface-background))];
  @apply [color:var(--kind-text-light)];
}

.workspace-shell.theme-dark .kind-pill {
  @apply [background:color-mix(in_srgb,var(--kind-bg-dark-color,var(--kind-color))_var(--kind-bg-dark-strength),var(--kind-bg-dark-base,var(--ui-surface-background)))];
  @apply [color:var(--kind-text-dark)];
}

.row-actions {
  @apply shrink-0 flex items-center justify-end gap-3px;
}

.icon-button {
  @apply size-23px border-0 rounded-4px p-0;
  @apply inline-flex items-center justify-center cursor-pointer;
  @apply bg-transparent color-$ui-muted-foreground;
  @apply hover:bg-$ui-hover-background hover:color-$ui-foreground;

  &:disabled {
    @apply opacity-35 cursor-not-allowed;
  }

  &.primary-action {
    @apply color-$blue-5;
  }

  &.danger {
    @apply color-$red-5;
  }

  &.copy-success {
    @apply color-$green-5;
  }

  &.copy-error {
    @apply color-$red-5;
  }
}

.icon-button.title-settings {
  @apply size-26px rounded-5px bg-transparent;
  @apply hover:bg-$ui-hover-background;
}

.cards-scroll {
  @apply min-h-0 flex-1;
}

.cards-body {
  @apply min-h-full p-10px;
  @apply grid gap-10px content-start;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.project-card {
  @apply min-w-0 rounded-6px border p-10px cursor-pointer;
  @apply border-$ui-border bg-$ui-control-background;
  @apply hover:bg-$ui-hover-background;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-$blue-5;
}

.card-header,
.card-footer,
.card-meta {
  @apply min-w-0 flex items-center gap-8px;
}

.card-header {
  @apply justify-between;
}

.card-title {
  @apply min-w-0 flex flex-col gap-2px;

  strong {
    @apply min-w-0 inline-flex items-center truncate text-13px font-650 light:color-$gray-1 dark:color-$gray-13;
  }
}

.card-path {
  @apply my-8px truncate text-11px light:color-$gray-6 dark:color-$gray-8;
}

.card-meta {
  @apply flex-wrap;
}

.card-footer {
  @apply mt-10px grid;
  grid-template-columns: minmax(0, 1fr) max-content;

  .editor-chip {
    @apply w-fit max-w-180px shrink justify-self-start;
  }

  .row-actions {
    @apply opacity-0 pointer-events-none;
    transition: opacity 120ms ease;
  }
}

.project-card:hover,
.project-card:focus,
.project-card:focus-within {
  .card-footer .row-actions {
    @apply opacity-100 pointer-events-auto;
  }
}

.empty-state {
  @apply h-full flex flex-col items-center justify-center gap-5px;
  @apply light:color-$gray-6 dark:color-$gray-8;

  strong {
    @apply text-14px light:color-$gray-2 dark:color-$gray-12;
  }
}

@media (max-width: 1020px) {
  .project-grid {
    grid-template-columns: minmax(220px, 1fr) 76px 104px 112px 156px;
  }

  .project-grid > :nth-child(5) {
    display: none;
  }
}

@media (max-width: 760px) {
  .workspace-topbar {
    @apply items-start;
  }

  .topbar-actions {
    @apply flex-wrap justify-end;
  }

  .filter-bar {
    @apply flex-wrap;
  }

  .search-box {
    @apply flex-none w-220px min-w-220px;
  }

  .layout-switch {
    @apply flex-none justify-center;
  }

  .clear-button {
    @apply shrink-0;
  }

  .project-grid {
    grid-template-columns: minmax(210px, 1fr) 76px 158px;
  }

  .project-grid > :nth-child(3),
  .project-grid > :nth-child(4),
  .project-grid > :nth-child(5) {
    display: none;
  }
}

@media (max-width: 560px) {
  .workspace-topbar {
    @apply gap-8px px-10px pt-8px pb-6px;
  }

  .title-block .count-badge {
    @apply inline-flex;
  }

  .topbar-actions {
    @apply gap-5px;
  }

  .primary-button,
  .ghost-button,
  .clear-button {
    @apply px-7px;
  }

  .project-table {
    @apply mx-10px mb-10px;
  }

  .filter-bar {
    @apply px-10px gap-5px;
  }

  .search-box {
    @apply w-188px min-w-188px;
  }

  .project-grid {
    grid-template-columns: minmax(180px, 1fr) 76px 84px;
  }

  .row-actions .icon-button:not(.primary-action):not(.copy-action):not(.more-action) {
    display: none;
  }

  .row-actions {
    @apply gap-2px;
  }

  .icon-button {
    @apply size-22px;
  }
}
</style>
