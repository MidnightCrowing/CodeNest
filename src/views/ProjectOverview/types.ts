import type { License } from '~/constants/license'
import type { ProjectKind } from '~/constants/projectKind'
import type { languagesGroupItem, ProjectLanguageInfo } from '~/constants/types'

interface KindInfo {
  kind: ProjectKind
  from?: string
  url?: string
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
