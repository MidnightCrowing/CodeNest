export enum Kind {
  all = 'all',
  mine = 'mine',
  fork = 'fork',
  clone = 'clone',
  test = 'test',
}
export enum KindMark {
  all = 'k-all',
  mine = 'k-mine',
  fork = 'k-fork',
  clone = 'k-clone',
  test = 'k-test',
}
export interface KindItem {
  kind: Kind
  i18nKey: string
}

export type Color = string
export type Language = string
export type LanguageMark = string
export interface LanguageItem {
  language: Language
  color: Color
}

export type ItemMark = KindMark & LanguageMark
export type ActivatedItem = Ref<ItemMark>
