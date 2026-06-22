import { HOME_LAYOUT_STORAGE_KEY } from '~/constants/storageKeys'

import type { LayoutMode } from '../types'

export function readStoredLayoutMode(): LayoutMode {
  try {
    const value = window.localStorage.getItem(HOME_LAYOUT_STORAGE_KEY)
    return value === 'grid' || value === 'list' ? value : 'list'
  }
  catch {
    return 'list'
  }
}

export function persistLayoutMode(value: LayoutMode) {
  try {
    window.localStorage.setItem(HOME_LAYOUT_STORAGE_KEY, value)
  }
  catch {
    // The layout toggle still works for the current session.
  }
}
