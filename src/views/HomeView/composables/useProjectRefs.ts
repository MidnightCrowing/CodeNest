import type { LocalProject } from '~/constants/localProject'

export function useProjectRefs() {
  const projectItemRefs = new Map<number, HTMLElement>()
  const projectActionRefs = new Map<number, HTMLElement>()

  function setProjectItemRef(projectId: number, element: unknown) {
    if (element instanceof HTMLElement) {
      projectItemRefs.set(projectId, element)
      return
    }

    projectItemRefs.delete(projectId)
  }

  function setProjectActionsRef(projectId: number, element: unknown) {
    if (element instanceof HTMLElement) {
      projectActionRefs.set(projectId, element)
      return
    }

    projectActionRefs.delete(projectId)
  }

  function deleteProjectRefs(projectId: LocalProject['appendTime']) {
    projectItemRefs.delete(projectId)
    projectActionRefs.delete(projectId)
  }

  function clearProjectRefs() {
    projectItemRefs.clear()
    projectActionRefs.clear()
  }

  async function playProjectRemoveAnimation(projectId: number): Promise<void> {
    const element = projectItemRefs.get(projectId)
    if (!element)
      return

    element.style.transition = 'opacity 180ms ease-out, transform 180ms ease-out'
    element.style.opacity = '0'
    element.style.transform = 'translateX(-12px)'

    await new Promise(resolve => setTimeout(resolve, 180))
  }

  return {
    projectItemRefs,
    projectActionRefs,
    setProjectItemRef,
    setProjectActionsRef,
    deleteProjectRefs,
    clearProjectRefs,
    playProjectRemoveAnimation,
  }
}
