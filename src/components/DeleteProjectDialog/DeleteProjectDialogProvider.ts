import type { LocalProject } from '~/constants/localProject'

export const isDialogVisible = ref(false)
export const projectToDelete = ref<LocalProject | null>(null)

export function showDeleteDialog(projectName: LocalProject) {
  projectToDelete.value = projectName
  isDialogVisible.value = true
}

export function hideDeleteDialog() {
  isDialogVisible.value = false
  projectToDelete.value = null
}
