import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
}
export type NullableLocalProject = Nullable<LocalProject> & {
  kind: ProjectKind
  license: LicenseEnum | string
  isTemporary: LocalProject['isTemporary']
}

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
  isRemote: false,
  remoteHost: null,
  remotePath: null,
}

export const localProjectItem: Ref<NullableLocalProject> = ref({ ...defaultLocalProjectState })
export const isUpdateProject = ref(false)

function mergeWithDefaults(newState: Partial<NullableLocalProject>) {
  localProjectItem.value = { ...defaultLocalProjectState, ...newState }
}

export function initializeNewProjectState(initialState: Partial<NullableLocalProject> = {}) {
  mergeWithDefaults(initialState)
  isUpdateProject.value = false
}

export function initializeUpdateProjectState(updatedState: LocalProject) {
  mergeWithDefaults(updatedState)
  isUpdateProject.value = true
}
