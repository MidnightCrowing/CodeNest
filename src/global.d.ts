import type { ThemeEnum } from '~/constants/appEnums'
import type { LinguistResult } from '~/views/ProjectEditorView'

declare global {
  interface Window {
    api: {
      // dialog
      openFolderDialog: () => Promise<string[]>
      openFileDialog: (fileTypes?: { name: string, extensions: string[] }[]) => Promise<string[]>

      // folder
      getFolderList: (folderPath: string) => Promise<{ folders: string[], error?: string }>

      // path
      formatPath: (filePath: string) => Promise<string>
      checkPathExistence: (path: string) => Promise<{ exists: boolean, error?: string }>

      // project
      analyzeProject: (folderPath: string) => Promise<LinguistResult | { error: string }>
      onProjectAnalyzeProgress: (cb: (data: { folderPath: string, stage: 'start' | 'checking' | 'analyzing' | 'done' }) => void) => () => void
      readProjectLicense: (folderPath: string, maxLines?: number) => Promise<{
        success: boolean
        filename?: string
        snippet?: string
        lines?: number
        message?: string
      }>
      openProject: (idePath: string, projectPath: string) => Promise<string>
      deleteProject: (projectPath: string) => Promise<boolean>
      importProject: () => Promise<boolean>
      exportProject: () => Promise<boolean>

      // settings
      openSettingsJSON: () => Promise<boolean>

      // data
      saveData: (fileType: string, data: string) => Promise<{ success: boolean, error?: string }>
      loadData: (fileType: string) => Promise<{ success: boolean, data?: string, error?: string }>
      deleteData: (fileType: string) => Promise<{ success: boolean, error?: string }>

      // system
      openExternal: (url: string) => void
      openInExplorer: (path: string) => void
      openInTerminal: (path: string) => void

      // update
      checkUpdate: () => Promise<{
        hasUpdate: boolean
        currentVersion: string
        latestVersion?: string
        url?: string
        name?: string
        notes?: string
        publishedAt?: string
        error?: string
      }>

      // scanner (batch)
      scanProjects: (payload: { roots: string[], existingPaths: string[] }) => Promise<
        Array<{
          path: string
          name: string
          mainLang?: string
          mainLangColor?: `#${string}`
          langGroup?: Array<{ text: string, color: `#${string}`, percentage: number }>
          error?: string
        }>
      >

      // scanner (stream)
      startProjectScan: (payload: {
        roots: string[]
        existingPaths: string[]
      }) => Promise<{ sessionId: number }>
      stopProjectScan: (sessionId: number) => Promise<{ stopped: boolean }>
      onScannerItem: (
        cb: (data: {
          sessionId: number
          item: {
            path: string
            name: string
            mainLang?: string
            mainLangColor?: `#${string}`
            langGroup?: Array<{ text: string, color: `#${string}`, percentage: number }>
            error?: string
          }
        }) => void
      ) => () => void
      onScannerDone: (cb: (data: { sessionId: number }) => void) => () => void
      onScannerError: (cb: (data: { sessionId: number, error: string }) => void) => () => void

      // theme
      setWindowTheme: (currentTheme: ThemeEnum) => void
    }
  }
}
