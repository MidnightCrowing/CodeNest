export type Color = string

export type ProjectLanguage = string
export interface ProjectLanguageInfo {
  text: ProjectLanguage
  color: Color
}

export interface languagesGroupItem extends ProjectLanguageInfo {
  percentage: number
}
