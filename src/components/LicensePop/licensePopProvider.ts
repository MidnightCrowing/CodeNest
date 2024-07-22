import { License } from '~/constants/license'

export const visible = ref(false)
export const position = reactive({ top: 0, left: 0 })
export const license = ref<License>(License.OTHER)

export function showPop(newLicense: License, top: number, left: number) {
  license.value = newLicense
  position.top = top
  position.left = left
  visible.value = true
}

export function hidePop() {
  visible.value = false
}
