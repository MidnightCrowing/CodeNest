import type { KindMark } from './constants'

export interface KindItem {
  kind: string
  i18nKey: string
}

export type LanguageMark = string

export type ItemMark = KindMark & LanguageMark
export type ActivatedItem = Ref<ItemMark>
