import type { LicenseEnum } from '~/constants/license'

import type { CodeEditorEnum } from './codeEditor'

// ProjectKind
export enum ProjectKind {
  MINE = 'mine',
  FORK = 'fork',
  CLONE = 'clone',
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
  // 项目被添加的时间戳（毫秒级）
  appendTime: number

  // 项目的本地路径
  path: string
  // 项目的名称
  name: string
  // 所属组
  group: string

  // 项目的类型，例如 MINE、FORK 等（使用枚举 ProjectKind 表示）
  kind: ProjectKind
  // （可选）项目来源的 URL
  fromUrl?: string
  // （可选）项目来源的名称
  fromName?: string

  // 项目的主编程语言
  mainLang: ProjectLanguage
  // （可选）主编程语言的配色（格式为 #RRGGBB）
  mainLangColor?: `#${string}`
  // 项目中包含的语言分组列表
  langGroup: languagesGroupItem[]

  // 默认打开该项目时使用的代码编辑器（例如 VSCode、Atom 等，使用枚举 CodeEditorEnum 表示）
  defaultOpen: CodeEditorEnum

  // （可选）项目使用的许可证类型（使用枚举 LicenseEnum 表示）
  license?: LicenseEnum

  // 标识该项目是否为临时项目
  isTemporary: boolean
  // （可选）标识该项目是否仍然存在于文件系统中
  isExists?: boolean
}
