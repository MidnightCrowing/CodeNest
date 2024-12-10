import type { LocalProject } from '~/constants/localProject'

export const isDialogVisible = ref(false)
export const projectToRemove = ref<LocalProject | null>(null)

export function showRemoveDialog(projectName: LocalProject) {
  projectToRemove.value = projectName
  isDialogVisible.value = true
}

export function hideRemoveDialog() {
  isDialogVisible.value = false
  projectToRemove.value = null
}
