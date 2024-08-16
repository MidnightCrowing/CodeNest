import type { languagesGroupItem } from '~/constants/projectLanguage'

export const visible = ref(false)
export const position = reactive({ top: 0, left: 0 })
export const languagesGroup = ref<languagesGroupItem>({ text: '', color: '', percentage: 0 })

export function showPop(newLanguagesGroup: languagesGroupItem, top: number, left: number) {
  languagesGroup.value = newLanguagesGroup
  position.top = top
  position.left = left
  visible.value = true
}

export function hidePop() {
  visible.value = false
}
