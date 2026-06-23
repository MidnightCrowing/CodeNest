<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import mainLangPop from '~/components/LanguagePop/LanguagePop.vue'
import { setRemoveAnimationCallback } from '~/components/RemoveProjectDialog'
import type { ViewEnum } from '~/constants/appEnums'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

import HomeEmptyState from './components/HomeEmptyState.vue'
import HomeFilterBar from './components/HomeFilterBar.vue'
import HomeHeader from './components/HomeHeader.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import ProjectList from './components/ProjectList.vue'
import { useDisplayPathCache } from './composables/useDisplayPathCache'
import { useProjectActions } from './composables/useProjectActions'
import { useProjectFilters } from './composables/useProjectFilters'
import { useProjectKeyboardNavigation } from './composables/useProjectKeyboardNavigation'
import { useProjectMenus } from './composables/useProjectMenus'
import { useProjectNavigation } from './composables/useProjectNavigation'
import { useProjectOpenState } from './composables/useProjectOpenState'
import { useProjectRefs } from './composables/useProjectRefs'
import { useProjectSearch } from './composables/useProjectSearch'
import { useVirtualScroll } from './composables/useVirtualScroll'
import type { LayoutMode, ScrollAreaRef } from './types'
import { persistLayoutMode, readStoredLayoutMode } from './utils/homeLayoutStorage'

defineOptions({
  name: 'Home',
})

const projectsStore = useProjectsStore()
const settingsStore = useSettingsStore()

// Composables
const pathCache = useDisplayPathCache()
const projectSearch = useProjectSearch(computed(() => projectsStore.allProjects))
const activatedView = inject('activatedView') as Ref<ViewEnum>
const { locale, t } = useI18n()

const { searchValue, clearSearch } = projectSearch
const projectFilters = useProjectFilters(projectSearch, t)
const {
  kindFilter,
  statusFilter,
  languageFilter,
  sortKey,
  filteredProjects,
  activeFilterCount,
  kindOptions,
  statusOptions,
  languageOptions,
  sortOptions,
  clearFilters,
} = projectFilters

const openState = useProjectOpenState()
const {
  isProjectOpening,
  isTerminalOpening,
} = openState

const layoutMode = ref<LayoutMode>(readStoredLayoutMode())

const virtualScroll = useVirtualScroll(filteredProjects, layoutMode)
const {
  renderedProjects,
  hasMoreProjects,
  resetRenderedProjects,
  setLoadMoreSentinelRef,
  ensureProjectRendered,
} = virtualScroll

function editorHasLaunchCommand(editor: CodeEditorEnum) {
  return !!settingsStore.getEditorLaunchConfig(editor).command.trim()
}

function editorOpensInTerminal(editor: CodeEditorEnum) {
  return settingsStore.getEditorLaunchConfig(editor).openInTerminal
}

const projectMenus = useProjectMenus({ t, editorHasLaunchCommand, editorOpensInTerminal })
const {
  projectMenuItems,
} = projectMenus

const projectRefs = useProjectRefs()
const {
  clearProjectRefs,
  deleteProjectRefs,
  playProjectRemoveAnimation,
  projectActionRefs,
  projectItemRefs,
  setProjectActionsRef,
  setProjectItemRef,
} = projectRefs
const listScrollAreaRef = ref<ScrollAreaRef | null>(null)
const cardsScrollAreaRef = ref<ScrollAreaRef | null>(null)

const projectNavigation = useProjectNavigation(
  activatedView,
  layoutMode,
  listScrollAreaRef,
  cardsScrollAreaRef,
)
const {
  navigateFromHome,
  restoreHomeScrollPosition,
} = projectNavigation

const projectActions = useProjectActions({
  deleteProjectRefs,
  navigateFromHome,
  openState,
})
const {
  addProject,
  clearCopyFeedbackTimers,
  clearProjectFromMaps,
  copyFeedback,
  copyProjectPath,
  editProject,
  handleProjectMenuSelect,
  openInExplorer,
  openInTerminal,
  openProject,
  openProjectSource,
  openSettings,
  showLanguage,
  syncing,
  syncProjects,
} = projectActions

const layoutOptions = computed<Array<{ value: LayoutMode, label: string, icon: string }>>(() => [
  { value: 'list', label: t('app.home.layout.list'), icon: 'i-lucide:list' },
  { value: 'grid', label: t('app.home.layout.grid'), icon: 'i-lucide:layout-grid' },
])

function setListScrollAreaRef(element: unknown) {
  listScrollAreaRef.value = element as ScrollAreaRef | null
}

function setCardsScrollAreaRef(element: unknown) {
  cardsScrollAreaRef.value = element as ScrollAreaRef | null
}

const keyboardNavigation = useProjectKeyboardNavigation({
  filteredProjects,
  layoutMode,
  refs: { projectActionRefs, projectItemRefs },
  ensureProjectRendered,
  openProject,
  editProject,
  copyProjectPath,
})
const {
  actionButtonTabIndex,
  handleProjectActionsKeydown,
  handleProjectContainerKeydown,
  isProjectActionDisabled,
} = keyboardNavigation

onActivated(() => {
  restoreHomeScrollPosition()
})

onMounted(() => {
  window.addEventListener('project-removed', handleProjectRemoved as EventListener)
  setRemoveAnimationCallback(playProjectRemoveAnimation)
})

onBeforeUnmount(() => {
  window.removeEventListener('project-removed', handleProjectRemoved as EventListener)
  setRemoveAnimationCallback(null)
  clearCopyFeedbackTimers()
  clearProjectRefs()
})

function handleProjectRemoved(event: CustomEvent<{ projectId: number }>) {
  clearProjectFromMaps(event.detail.projectId)
}

watch(
  renderedProjects,
  (projects) => {
    const livePaths = new Set(projectsStore.allProjects.map(project => project.path))
    pathCache.pruneCache(livePaths)
    projects.forEach((project) => {
      // 远程项目的 path 是 host:remotePath 合成串,不走本地路径格式化
      if (!project.isRemote)
        void pathCache.cacheDisplayPath(project.path)
    })
  },
  { immediate: true },
)

function updateLayoutMode(value: string) {
  layoutMode.value = value as LayoutMode
}

watch(layoutMode, () => {
  resetRenderedProjects()
  persistLayoutMode(layoutMode.value)
})
</script>

<template>
  <main
    size-full overflow-hidden flex flex-col
    bg="$ui-page-background"
  >
    <HomeHeader
      :total="filteredProjects.length"
      :syncing="syncing"
      :scanner-enabled="settingsStore.scannerEnabled"
      @add="addProject"
      @sync="syncProjects"
      @settings="openSettings"
    />

    <HomeFilterBar
      v-model:search-value="searchValue"
      v-model:kind-filter="kindFilter"
      v-model:status-filter="statusFilter"
      v-model:language-filter="languageFilter"
      v-model:sort-key="sortKey"
      :layout-mode="layoutMode"
      :kind-options="kindOptions"
      :status-options="statusOptions"
      :language-options="languageOptions"
      :sort-options="sortOptions"
      :layout-options="layoutOptions"
      :active-filter-count="activeFilterCount"
      @update:layout-mode="updateLayoutMode"
      @clear-search="clearSearch"
      @clear-filters="clearFilters"
    />

    <section
      min-h-0 mx-14px mb-14px flex-1 overflow-hidden
      rounded-6px flex flex-col
      bg="$ui-surface-background"
      shadow="$shadow-surface"
      class="project-table"
      :aria-label="t('app.home.project_list')"
    >
      <HomeEmptyState v-if="filteredProjects.length === 0" />

      <ProjectList
        v-else-if="layoutMode === 'list'"
        :projects="renderedProjects"
        :has-more-projects="hasMoreProjects"
        :locale="locale"
        :display-project-path="pathCache.displayProjectPath"
        :project-menu-items="projectMenuItems"
        :is-project-opening="isProjectOpening"
        :is-terminal-opening="isTerminalOpening"
        :copy-feedback="copyFeedback"
        :action-button-tab-index="actionButtonTabIndex"
        :is-project-action-disabled="isProjectActionDisabled"
        @scroll-ref="setListScrollAreaRef"
        @sentinel-ref="setLoadMoreSentinelRef"
        @item-ref="setProjectItemRef"
        @actions-ref="setProjectActionsRef"
        @open="openProject"
        @container-keydown="handleProjectContainerKeydown"
        @actions-keydown="handleProjectActionsKeydown"
        @show-language="showLanguage"
        @open-source="openProjectSource"
        @open-explorer="openInExplorer"
        @open-terminal="openInTerminal"
        @copy-path="copyProjectPath"
        @menu-select="handleProjectMenuSelect"
      />

      <ProjectGrid
        v-else
        :projects="renderedProjects"
        :has-more-projects="hasMoreProjects"
        :display-project-path="pathCache.displayProjectPath"
        :project-menu-items="projectMenuItems"
        :is-project-opening="isProjectOpening"
        :is-terminal-opening="isTerminalOpening"
        :copy-feedback="copyFeedback"
        :action-button-tab-index="actionButtonTabIndex"
        :is-project-action-disabled="isProjectActionDisabled"
        @scroll-ref="setCardsScrollAreaRef"
        @sentinel-ref="setLoadMoreSentinelRef"
        @item-ref="setProjectItemRef"
        @actions-ref="setProjectActionsRef"
        @open="openProject"
        @container-keydown="handleProjectContainerKeydown"
        @actions-keydown="handleProjectActionsKeydown"
        @show-language="showLanguage"
        @open-source="openProjectSource"
        @open-explorer="openInExplorer"
        @open-terminal="openInTerminal"
        @copy-path="copyProjectPath"
        @menu-select="handleProjectMenuSelect"
      />
    </section>

    <mainLangPop />
  </main>
</template>

<style lang="scss">
@media (max-width: 560px) {
  .project-table {
    @apply mx-10px mb-10px;
  }
}
</style>
