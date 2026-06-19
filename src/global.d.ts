import type { ThemeEnum } from '~/constants/appEnums'
import type { EditorCommandKey } from '~/constants/codeEditor'
import type { LicenseEnum } from '~/constants/license'
import type { DataFileEnum } from '~/stores/helpers/persistence'
import type { ScannerSettings, WebDavSettings } from '~/stores/settingsStore'
import type { LinguistResult } from '~/types/linguist'

type HexColor = `#${string}`
interface ErrorResult { error: string }

interface DialogOpenOptions {
  title?: string
}

interface FileTypeFilter {
  name: string
  extensions: string[]
}

interface FileDialogOptions extends DialogOpenOptions {
  fileTypes?: FileTypeFilter[]
}

interface PathExistenceResult {
  exists: boolean
  error?: string
}

interface LicenseReadResult {
  success: boolean
  filename?: string
  snippet?: string
  lines?: number
  message?: string
}

interface BasicResult {
  success: boolean
  error?: string
}

interface DataResult {
  success: boolean
  data?: string
  error?: string
}

interface ProjectMutationResult {
  success: boolean
  message?: string
  error?: string
}

interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  url?: string
  name?: string
  notes?: string
  publishedAt?: string
  error?: string
}

interface LangGroupItem {
  text: string
  color: HexColor
  percentage: number
}

interface ScanItem {
  path: string
  name: string
  mainLang?: string
  mainLangColor?: HexColor
  langGroup?: LangGroupItem[]
  ide?: string | null
  error?: string
  signature?: string
}

interface ScanCacheEntry extends ScanItem {
  signature: string
  license?: LicenseEnum
}

export interface ScanStartPayload extends Omit<ScannerSettings, 'rootOpenMode' | 'ideOpenMode' | 'editor' | 'namePattern'> {
  existingPaths: string[]
  cacheEntries: ScanCacheEntry[]
}

interface ScanResult {
  items: ScanItem[]
}

interface WebDavSyncResult {
  success: boolean
  message?: string
  error?: string
}

declare global {
  interface Window {
    api: {
      openFolderDialog: (options?: DialogOpenOptions) => Promise<string[]>
      openFileDialog: (options?: FileDialogOptions) => Promise<string[]>

      formatPath: (filePath: string) => Promise<string>
      checkPathExistence: (path: string) => Promise<PathExistenceResult>

      analyzeProject: (folderPath: string) => Promise<LinguistResult | ErrorResult>
      readProjectLicense: (folderPath: string, maxLines?: number) => Promise<LicenseReadResult>
      openProject: (editorCommand: string, projectPath: string, openInTerminal?: boolean) => Promise<string>
      openRemoteProject: (host: string, remotePath: string, editorCommand: string, mode: 'vscode' | 'terminal') => Promise<string>
      detectEditorCommand: (editor: EditorCommandKey) => Promise<string | null>
      deleteProject: (projectPath: string) => Promise<ProjectMutationResult>
      importProject: () => Promise<ProjectMutationResult>
      exportProject: () => Promise<ProjectMutationResult>

      saveData: (fileType: DataFileEnum, data: string) => Promise<BasicResult>
      loadData: (fileType: DataFileEnum) => Promise<DataResult>
      openData: (fileType: DataFileEnum) => Promise<boolean>
      deleteData: (fileType: DataFileEnum) => Promise<BasicResult>

      openExternal: (url: string) => void
      openInExplorer: (path: string) => void
      openInTerminal: (path: string, terminalCommand?: string) => Promise<string>

      checkUpdate: () => Promise<UpdateCheckResult>

      scanProjects: (payload: ScanStartPayload) => Promise<ScanResult>
      getSystemAccentColor: (currentTheme?: ThemeEnum) => Promise<HexColor | null>
      detectJetBrainsConfigRootPath: () => Promise<string | null>
      detectRecentEditorStateDbPath: (editor: EditorCommandKey) => Promise<string | null>
      detectCliHistoryRootPath: (editor: EditorCommandKey) => Promise<string | null>
      detectVscodeStateDbPath: () => Promise<string | null>
      loadWebDavPassword: () => Promise<string | null>
      saveWebDavPassword: (password: string) => Promise<void>
      deleteWebDavPassword: () => Promise<void>
      webdavTestConnection: (config: WebDavSettings) => Promise<WebDavSyncResult>
      webdavUploadData: (config: WebDavSettings) => Promise<WebDavSyncResult>
      webdavPullData: (config: WebDavSettings) => Promise<WebDavSyncResult>

      setWindowTheme: (currentTheme: ThemeEnum) => void
      minimizeWindow: () => Promise<boolean>
      toggleMaximizeWindow: () => Promise<boolean>
      closeWindow: () => Promise<boolean>
    }
  }
}

export {}
