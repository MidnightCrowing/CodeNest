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
  color: string
}

export interface languagesGroupItem extends ProjectLanguageInfo {
  percentage: number
}

// LocalProject
export interface LocalProject {
  appendTime: number | null
  path: string | null
  name: string | null
  kind: ProjectKind | null
  fromUrl?: string | null
  fromName?: string | null
  mainLang: ProjectLanguage | null
  langGroup: languagesGroupItem[] | null
  defaultOpen: CodeEditorEnum | null
  license?: LicenseEnum | null
}
