export const isDialogVisible = ref(false)

export function showNoIdePathDialog() {
  isDialogVisible.value = true
}

export function hideNoIdePathDialog() {
  isDialogVisible.value = false
}
