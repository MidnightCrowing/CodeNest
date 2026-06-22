/**
 * HomeView 共享类型定义
 */

export interface ScrollAreaRef {
  $el?: Element
}

export type LayoutMode = 'list' | 'grid'

export type ProjectActionKey = 'open' | 'explorer' | 'terminal' | 'copy' | 'more'
