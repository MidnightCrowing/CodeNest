import type { ThemeEnum } from '~/utils/theme'
import type { LinguistResult } from '~/views/NewProject/types'

declare global {
  interface Window {
    api: {
      setWindowTheme: (currentTheme: ThemeEnum) => void
      openFolderDialog: () => Promise<string[]>
      openExternal: (url: string) => void
      analyzeFolder: (folderPath: string) => Promise<LinguistResult>
      saveProjectData: (data: string) => Promise<{ success: boolean, error?: string }>
      loadProjectData: () => Promise<{ success: boolean, data?: string, error?: string }>
    }
  }
}
