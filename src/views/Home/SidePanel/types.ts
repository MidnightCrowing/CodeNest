import type { KindMenuList, KindMenuMark } from './constants'

export interface KindMenuItem {
  kind: KindMenuList
  i18nKey: string
}

export type LanguageMenuMark = string

export type ItemMenuMark = KindMenuMark & LanguageMenuMark
export type ActivatedMenuItem = Ref<ItemMenuMark>
