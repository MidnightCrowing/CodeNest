import type { DesktopApi } from '~/desktop/types'

declare global {
  interface Window {
    api: DesktopApi
  }
}

export {}
