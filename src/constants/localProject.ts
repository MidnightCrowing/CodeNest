import type { LicenseEnum } from '~/constants/license'

import type { CodeEditorEnum } from './codeEditor'

export enum ProjectKind {
  MINE = 'mine',
  FORK = 'fork',
  CLONE = 'clone',
}

export type ProjectLanguage = string
export interface ProjectLanguageInfo {
  text: ProjectLanguage
  color: `#${string}`
}

export interface languagesGroupItem extends ProjectLanguageInfo {
  percentage: number
}

export interface LocalProject {
  /** 项目被添加的时间戳（毫秒）；也作为列表内稳定 id 使用 */
  appendTime: number
  /** 最近一次通过 CodeNest 打开的时间戳（毫秒） */
  lastOpenedAt?: number

  /** 本地绝对路径；远程项目为 `${remoteHost}:${remotePath}` 合成串，仅用于展示与去重 */
  path: string
  name: string
  group: string

  kind: ProjectKind
  fromUrl?: string
  fromName?: string

  mainLang: ProjectLanguage
  mainLangColor?: `#${string}`
  langGroup: languagesGroupItem[]

  defaultOpen: CodeEditorEnum
  license?: LicenseEnum

  isTemporary: boolean
  isPinned?: boolean
  /** 归档项目不出现在默认列表中 */
  isArchived?: boolean
  isExists: boolean

  /** 远程 SSH 项目没有本地路径 */
  isRemote?: boolean
  /** ~/.ssh/config 别名或 user@host[:port]；认证/端口/密钥交给 ssh */
  remoteHost?: string
  /** 远程绝对路径（POSIX） */
  remotePath?: string
}
