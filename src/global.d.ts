import type { ThemeEnum } from '~/constants/appEnums'
import type { LinguistResult } from '~/views/NewProject/types'

declare global {
  interface Window {
    api: {
      // dialog
      openFolderDialog: () => Promise<string[]>
      openFileDialog: (fileTypes?: { name: string, extensions: string[] }[]) => Promise<string[]>

      // folder
      getFolderList: (folderPath: string) => Promise<{ folders: string[], error?: string }>

      // path
      formatPath: (filePath: string) => string
      checkPathExistence: (path: string) => Promise<{ exists: boolean, error?: string }>

      // project
      analyzeProject: (folderPath: string) => Promise<LinguistResult | { error: string }>
      openProject: (idePath: string, projectPath: string) => Promise<string>
      deleteProject: (projectPath: string) => Promise<boolean>
      importProject: () => Promise<boolean>
      exportProject: () => Promise<boolean>

      // settings
      openSettingsJSON: () => Promise<boolean>

      // data
      saveData: (fileType: 'projects' | 'projectScanner' | 'settings', data: string) => Promise<{ success: boolean, error?: string }>
      loadData: (fileType: 'projects' | 'projectScanner' | 'settings') => Promise<{ success: boolean, data?: string, error?: string }>
      deleteData: (fileType: 'projects' | 'projectScanner' | 'settings') => Promise<{ success: boolean, error?: string }>

      // system
      openExternal: (url: string) => void
      openInExplorer: (path: string) => void
      openInTerminal: (path: string) => void

      // theme
      setWindowTheme: (currentTheme: ThemeEnum) => void
    }
  }
}
