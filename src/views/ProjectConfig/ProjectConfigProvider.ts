import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
}
export type NullableLocalProject = Nullable<LocalProject> & {
  kind: ProjectKind
  license: LicenseEnum | string
  isTemporary: boolean
}

// 默认的 LocalProject 状态
const defaultLocalProjectState: Readonly<NullableLocalProject> = {
  appendTime: null,
  path: null,
  name: null,
  group: null,
  kind: ProjectKind.MINE,
  mainLang: null,
  langGroup: null,
  defaultOpen: null,
  license: LicenseEnum.NONE,
  isTemporary: false,
  isExists: true,
}

export const localProjectItem: Ref<NullableLocalProject> = ref({ ...defaultLocalProjectState }) // 创建副本
export const isUpdateProject = ref(false)

function mergeWithDefaults(newState: Partial<NullableLocalProject>) {
  localProjectItem.value = { ...defaultLocalProjectState, ...newState }
}

/**
 * 初始化新建项目的状态
 * @param initialState - 可选的初始状态对象，部分字段可传入
 */
export function initializeNewProjectState(initialState: Partial<NullableLocalProject> = {}) {
  mergeWithDefaults(initialState) // 初始化为默认状态并合并传入状态
  isUpdateProject.value = false // 新建项目时标记为 false
}

/**
 * 初始化更新项目的状态
 * @param updatedState - 必须提供的更新状态对象
 */
export function initializeUpdateProjectState(updatedState: LocalProject) {
  mergeWithDefaults(updatedState) // 用传入的更新状态覆盖现有状态
  isUpdateProject.value = true // 更新项目时标记为 true
}
