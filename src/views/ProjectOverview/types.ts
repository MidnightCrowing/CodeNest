import type { License } from '~/constants/license'
import type { ProjectKind } from '~/constants/projectKind'
import type { ProjectLanguageInfo } from '~/constants/types'

interface KindInfo {
  kind: ProjectKind
  from?: string
  url?: string
}

export interface languagesGroupItem extends ProjectLanguageInfo {
  percentage: number
}

export interface ProjectItem {
  name: string
  path: string
  kindInfo: KindInfo
  language: ProjectLanguageInfo
  languagesGroup: languagesGroupItem[]
  license: License
  openWith: string
}
