export enum Kind {
  all = 'all',
  mine = 'mine',
  fork = 'fork',
  clone = 'clone',
  test = 'test',
}
export interface KindItem {
  kind: Kind
  i18nKey: string
}

export type Color = string
export type Language = string
export interface LanguageItem {
  language: Language
  color: Color
}

export type GroupItem = Kind & Language
export type ActivatedItem = Ref<GroupItem>
