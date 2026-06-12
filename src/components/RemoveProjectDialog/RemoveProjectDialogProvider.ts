import type { LocalProject } from '~/constants/localProject'

export const isDialogVisible = ref(false)
export const projectToRemove = ref<LocalProject | null>(null)
export const projectsToRemove = ref<LocalProject[]>([])

type RemoveAnimationCallback = (projectId: number) => Promise<void>
let removeAnimationCallback: RemoveAnimationCallback | null = null

export function setRemoveAnimationCallback(callback: RemoveAnimationCallback | null) {
  removeAnimationCallback = callback
}

export async function playRemoveAnimation(projectId: number) {
  if (removeAnimationCallback) {
    await removeAnimationCallback(projectId)
  }
}

export function showRemoveDialog(project: LocalProject) {
  projectToRemove.value = project
  projectsToRemove.value = []
  isDialogVisible.value = true
}

export function showBatchRemoveDialog(projects: LocalProject[]) {
  projectToRemove.value = null
  projectsToRemove.value = projects
  isDialogVisible.value = true
}

export function hideRemoveDialog() {
  isDialogVisible.value = false
  projectToRemove.value = null
  projectsToRemove.value = []
}
