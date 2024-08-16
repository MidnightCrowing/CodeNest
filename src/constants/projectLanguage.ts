export type ProjectLanguage = string
export interface ProjectLanguageInfo {
  text: ProjectLanguage
  color: string
}

export interface languagesGroupItem extends ProjectLanguageInfo {
  percentage: number
}
