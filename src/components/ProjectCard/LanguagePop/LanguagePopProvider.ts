import type { languagesGroupItem } from '~/constants/localProject'

export const popupVisible: Ref<boolean> = ref(false)
export const position: { top: number, left: number } = reactive({ top: 0, left: 0 })
export const languagesGroup: Ref<languagesGroupItem[]> = ref<languagesGroupItem[]>([])

export function showPop(newLanguagesGroup: languagesGroupItem[], top: number, left: number) {
  languagesGroup.value = newLanguagesGroup
  position.top = top
  position.left = left
  popupVisible.value = true
}

export function hidePop() {
  popupVisible.value = false
}
