import type { ThemeEnum } from '~/constants/appEnums'
import type { LinguistResult } from '~/views/NewProject/types'

declare global {
  interface Window {
    api: {
      setWindowTheme: (currentTheme: ThemeEnum) => void
      openFolderDialog: () => Promise<string[]>
      openFileDialog: (fileTypes?: { name: string, extensions: string[] }[]) => Promise<string[]>
      openExternal: (url: string) => void
      analyzeFolder: (folderPath: string) => Promise<LinguistResult>
      saveProjectData: (data: string) => Promise<{ success: boolean, error?: string }>
      loadProjectData: () => Promise<{ success: boolean, data?: string, error?: string }>
      saveSettingsData: (data: string) => Promise<{ success: boolean, error?: string }>
      loadSettingsData: () => Promise<{ success: boolean, data?: string, error?: string }>
      openProject: (idePath: string, projectPath: string) => Promise<string>
      openSettingsJSON: () => Promise<boolean>
    }
  }
}
