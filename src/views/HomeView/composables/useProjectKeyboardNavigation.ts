import type { Ref } from 'vue'

import { showRemoveDialog } from '~/components/RemoveProjectDialog'
import type { LocalProject } from '~/constants/localProject'

import { PROJECT_ACTION_KEYS } from '../constants'
import type { LayoutMode, ProjectActionKey } from '../types'

interface ProjectRefs {
  projectItemRefs: Map<number, HTMLElement>
  projectActionRefs: Map<number, HTMLElement>
}

interface ProjectKeyboardNavigationOptions {
  filteredProjects: Ref<LocalProject[]>
  layoutMode: Ref<LayoutMode>
  refs: ProjectRefs
  ensureProjectRendered: (project: LocalProject) => Promise<void>
  openProject: (project: LocalProject) => Promise<void>
  editProject: (project: LocalProject) => void
  copyProjectPath: (project: LocalProject) => Promise<void>
}

export function useProjectKeyboardNavigation(options: ProjectKeyboardNavigationOptions) {
  const {
    filteredProjects,
    layoutMode,
    refs,
    ensureProjectRendered,
    openProject,
    editProject,
    copyProjectPath,
  } = options

  async function focusProject(project: LocalProject | undefined) {
    if (!project?.isExists)
      return

    await ensureProjectRendered(project)

    const element = refs.projectItemRefs.get(project.appendTime)
    if (!element)
      return

    element.focus({ preventScroll: true })
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  function findProjectByLinearOffset(project: LocalProject, offset: number, includeMissing = false) {
    const projects = filteredProjects.value.filter(item => includeMissing || item.isExists)
    const currentIndex = projects.findIndex(item => item.appendTime === project.appendTime)
    if (currentIndex < 0)
      return undefined

    const targetIndex = Math.max(0, Math.min(projects.length - 1, currentIndex + offset))
    return projects[targetIndex]
  }

  function focusProjectByLinearOffset(project: LocalProject, offset: number) {
    focusProject(findProjectByLinearOffset(project, offset))
  }

  function focusProjectAtEdge(edge: 'start' | 'end') {
    const focusableProjects = filteredProjects.value.filter(item => item.isExists)
    focusProject(edge === 'start' ? focusableProjects[0] : focusableProjects.at(-1))
  }

  function openProjectContextMenuFromKeyboard(event: KeyboardEvent) {
    const target = event.currentTarget
    if (!(target instanceof HTMLElement))
      return

    const rect = target.getBoundingClientRect()
    target.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + Math.min(36, rect.width / 2),
      clientY: rect.top + Math.min(24, rect.height / 2),
    }))
  }

  function findProjectByGridDirection(project: LocalProject, direction: 'left' | 'right' | 'up' | 'down', includeMissing = false) {
    const currentElement = refs.projectItemRefs.get(project.appendTime)
    if (!currentElement)
      return findProjectByGridLinearDirection(project, direction, includeMissing)

    const currentRect = currentElement.getBoundingClientRect()
    const currentCenterX = currentRect.left + currentRect.width / 2
    const sameRowTolerance = Math.max(8, currentRect.height / 2)

    const candidates = filteredProjects.value
      .filter(item => (includeMissing || item.isExists) && item.appendTime !== project.appendTime)
      .map((item) => {
        const element = refs.projectItemRefs.get(item.appendTime)
        return element
          ? { project: item, rect: element.getBoundingClientRect() }
          : null
      })
      .filter(item => item !== null)

    if (direction === 'left' || direction === 'right') {
      const sameRow = candidates
        .filter(item => Math.abs(item.rect.top - currentRect.top) <= sameRowTolerance)
        .filter(item => direction === 'left' ? item.rect.left < currentRect.left : item.rect.left > currentRect.left)
        .sort((a, b) => direction === 'left' ? b.rect.left - a.rect.left : a.rect.left - b.rect.left)

      if (sameRow[0])
        return sameRow[0].project

      return findProjectByLinearOffset(project, direction === 'left' ? -1 : 1, includeMissing)
    }

    const verticalCandidates = candidates
      .filter(item => direction === 'up' ? item.rect.top < currentRect.top - 4 : item.rect.top > currentRect.top + 4)
      .sort((a, b) => {
        const rowDistanceA = Math.abs(a.rect.top - currentRect.top)
        const rowDistanceB = Math.abs(b.rect.top - currentRect.top)
        if (rowDistanceA !== rowDistanceB)
          return rowDistanceA - rowDistanceB

        const centerA = a.rect.left + a.rect.width / 2
        const centerB = b.rect.left + b.rect.width / 2
        return Math.abs(centerA - currentCenterX) - Math.abs(centerB - currentCenterX)
      })

    return verticalCandidates[0]?.project || findProjectByGridLinearDirection(project, direction, includeMissing)
  }

  function focusCardByDirection(project: LocalProject, direction: 'left' | 'right' | 'up' | 'down') {
    focusProject(findProjectByGridDirection(project, direction))
  }

  function findProjectByGridLinearDirection(project: LocalProject, direction: 'left' | 'right' | 'up' | 'down', includeMissing = false) {
    const projects = filteredProjects.value.filter(item => includeMissing || item.isExists)
    const currentIndex = projects.findIndex(item => item.appendTime === project.appendTime)
    if (currentIndex < 0)
      return undefined

    const columnCount = getRenderedGridColumnCount()
    const offset = {
      left: -1,
      right: 1,
      up: -columnCount,
      down: columnCount,
    }[direction]

    const targetIndex = Math.max(0, Math.min(projects.length - 1, currentIndex + offset))
    return projects[targetIndex]
  }

  function getRenderedGridColumnCount() {
    const firstElement = refs.projectItemRefs.values().next().value
    if (!(firstElement instanceof HTMLElement))
      return 1

    const firstTop = firstElement.getBoundingClientRect().top
    let columnCount = 0

    for (const element of refs.projectItemRefs.values()) {
      if (Math.abs(element.getBoundingClientRect().top - firstTop) <= 4)
        columnCount += 1
    }

    return Math.max(1, columnCount)
  }

  function isProjectActionDisabled(project: LocalProject, action: ProjectActionKey) {
    if (project.isRemote && action === 'explorer')
      return true
    return !project.isExists && (action === 'open' || action === 'explorer' || action === 'terminal')
  }

  function firstEnabledProjectAction(project: LocalProject) {
    return PROJECT_ACTION_KEYS.find(action => !isProjectActionDisabled(project, action)) || 'more'
  }

  function actionButtonTabIndex(project: LocalProject, action: ProjectActionKey) {
    if (isProjectActionDisabled(project, action))
      return -1

    return firstEnabledProjectAction(project) === action ? 0 : -1
  }

  function projectActionKey(button: HTMLButtonElement) {
    const action = button.dataset.projectAction
    return PROJECT_ACTION_KEYS.includes(action as ProjectActionKey)
      ? action as ProjectActionKey
      : null
  }

  function toolbarActionButtons(toolbar: HTMLElement) {
    return Array.from(toolbar.querySelectorAll<HTMLButtonElement>('[data-project-action]'))
      .filter(button => !button.disabled && button.getClientRects().length > 0)
  }

  function focusToolbarButtonAtIndex(toolbar: HTMLElement, index: number) {
    const buttons = toolbarActionButtons(toolbar)
    if (!buttons.length)
      return

    const targetIndex = Math.max(0, Math.min(buttons.length - 1, index))
    buttons[targetIndex]?.focus({ preventScroll: true })
  }

  async function focusProjectAction(project: LocalProject | undefined, preferredAction: ProjectActionKey | null, preferredIndex: number) {
    if (!project)
      return

    await ensureProjectRendered(project)

    const toolbar = refs.projectActionRefs.get(project.appendTime)
    if (!toolbar)
      return

    const buttons = toolbarActionButtons(toolbar)
    if (!buttons.length)
      return

    const sameActionButton = preferredAction
      ? buttons.find(button => projectActionKey(button) === preferredAction)
      : undefined
    const fallbackIndex = Math.max(0, Math.min(buttons.length - 1, preferredIndex))
    const target = sameActionButton || buttons[fallbackIndex] || buttons[0]

    target.focus({ preventScroll: true })
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  function handleProjectActionsKeydown(project: LocalProject, event: KeyboardEvent) {
    if (event.defaultPrevented)
      return

    if (handleProjectShortcut(project, event))
      return

    const toolbar = event.currentTarget
    if (!(toolbar instanceof HTMLElement))
      return

    const target = event.target instanceof HTMLElement
      ? event.target.closest<HTMLButtonElement>('[data-project-action]')
      : null
    const buttons = toolbarActionButtons(toolbar)
    const currentIndex = target ? buttons.indexOf(target) : -1
    const action = target ? projectActionKey(target) : null

    if (!buttons.length)
      return

    const focusHorizontalAction = (offset: number) => {
      event.preventDefault()
      event.stopPropagation()
      focusToolbarButtonAtIndex(toolbar, currentIndex < 0 ? 0 : currentIndex + offset)
    }

    const focusVerticalAction = (offset: number, direction: 'up' | 'down') => {
      event.preventDefault()
      event.stopPropagation()
      const targetProject = layoutMode.value === 'grid'
        ? findProjectByGridDirection(project, direction, true)
        : findProjectByLinearOffset(project, offset, true)
      focusProjectAction(targetProject, action, currentIndex)
    }

    switch (event.key) {
      case 'ArrowLeft':
        focusHorizontalAction(-1)
        break
      case 'ArrowRight':
        focusHorizontalAction(1)
        break
      case 'ArrowUp':
        focusVerticalAction(-1, 'up')
        break
      case 'ArrowDown':
        focusVerticalAction(1, 'down')
        break
      case 'Home':
        event.preventDefault()
        event.stopPropagation()
        focusToolbarButtonAtIndex(toolbar, 0)
        break
      case 'End':
        event.preventDefault()
        event.stopPropagation()
        focusToolbarButtonAtIndex(toolbar, buttons.length - 1)
        break
    }
  }

  function handleProjectShortcut(project: LocalProject, event: KeyboardEvent) {
    const usesCommandModifier = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey
    const key = event.key.toLowerCase()

    if (usesCommandModifier && key === 'i') {
      event.preventDefault()
      event.stopPropagation()
      editProject(project)
      return true
    }

    if (usesCommandModifier && key === 'c') {
      event.preventDefault()
      event.stopPropagation()
      void copyProjectPath(project)
      return true
    }

    const isRemoveKey = !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
      && (event.key === 'Delete' || event.key === 'Backspace')
    if (isRemoveKey) {
      event.preventDefault()
      event.stopPropagation()
      showRemoveDialog(project)
      return true
    }

    return false
  }

  function handleProjectContainerKeydown(project: LocalProject, event: KeyboardEvent) {
    if (event.target !== event.currentTarget)
      return

    if (handleProjectShortcut(project, event))
      return

    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        void openProject(project)
        break
      case ' ':
        event.preventDefault()
        void openProject(project)
        break
      case 'ContextMenu':
        event.preventDefault()
        openProjectContextMenuFromKeyboard(event)
        break
      case 'F10':
        if (!event.shiftKey)
          return
        event.preventDefault()
        openProjectContextMenuFromKeyboard(event)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (layoutMode.value === 'grid')
          focusCardByDirection(project, 'up')
        else
          focusProjectByLinearOffset(project, -1)
        break
      case 'ArrowDown':
        event.preventDefault()
        if (layoutMode.value === 'grid')
          focusCardByDirection(project, 'down')
        else
          focusProjectByLinearOffset(project, 1)
        break
      case 'ArrowLeft':
        if (layoutMode.value !== 'grid')
          return
        event.preventDefault()
        focusCardByDirection(project, 'left')
        break
      case 'ArrowRight':
        if (layoutMode.value !== 'grid')
          return
        event.preventDefault()
        focusCardByDirection(project, 'right')
        break
      case 'Home':
        event.preventDefault()
        focusProjectAtEdge('start')
        break
      case 'End':
        event.preventDefault()
        focusProjectAtEdge('end')
        break
    }
  }

  return {
    actionButtonTabIndex,
    handleProjectActionsKeydown,
    handleProjectContainerKeydown,
    isProjectActionDisabled,
  }
}
