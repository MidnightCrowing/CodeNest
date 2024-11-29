import type { LicenseEnum } from '~/constants/license'

import type { CodeEditorEnum } from './codeEditor'

// ProjectKind
export enum ProjectKind {
  MINE = 'mine',
  FORK = 'fork',
  CLONE = 'clone',
  TEST = 'test',
}

// ProjectLanguage
export type ProjectLanguage = string
export interface ProjectLanguageInfo {
  text: ProjectLanguage
  color: `#${string}`
}

export interface languagesGroupItem extends ProjectLanguageInfo {
  percentage: number
}

// LocalProject
export interface LocalProject {
  appendTime: number // 创建时间
  path: string
  name: string
  kind: ProjectKind
  fromUrl?: string
  fromName?: string
  mainLang: ProjectLanguage
  mainLangColor?: `#${string}`
  langGroup: languagesGroupItem[]
  defaultOpen: CodeEditorEnum
  license?: LicenseEnum
}
