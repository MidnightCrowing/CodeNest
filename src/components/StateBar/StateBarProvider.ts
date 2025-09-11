import { computed, ref } from 'vue'

interface StateEntry {
  message: string
  loading?: boolean
}

// 所有模块状态
const stateMap = ref<Map<string, StateEntry>>(new Map())

// 显示最新变化的状态
export const latestState = computed(() => {
  const values = Array.from(stateMap.value.values())
  return values.length > 0 ? values[values.length - 1] : undefined
})

// 注册或更新状态
export function setState(key: string, message: string, loading = false) {
  stateMap.value.set(key, { message, loading })
}

// 取消某个模块的状态
export function clearState(key: string) {
  stateMap.value.delete(key)
}

// 清空所有状态
export function clearAllStates() {
  stateMap.value.clear()
}
