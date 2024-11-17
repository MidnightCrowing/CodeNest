import { License } from '~/constants/license'

export const popupVisible: Ref<boolean> = ref(false)
export const position: { top: number, left: number } = reactive({ top: 0, left: 0 })
export const license: Ref<License> = ref<License>(License.OTHER)

export function showPop(newLicense: License, top: number, left: number) {
  license.value = newLicense
  position.top = top
  position.left = left
  popupVisible.value = true
}

export function hidePop() {
  popupVisible.value = false
}
