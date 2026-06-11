import type { LocalProject } from '~/constants/localProject'

export const isDialogVisible = ref(false)
export const projectToRemove = ref<LocalProject | null>(null)

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

export function showRemoveDialog(projectName: LocalProject) {
  projectToRemove.value = projectName
  isDialogVisible.value = true
}

export function hideRemoveDialog() {
  isDialogVisible.value = false
  projectToRemove.value = null
}
