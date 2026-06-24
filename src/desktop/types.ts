import type { ThemeEnum } from '~/constants/appEnums'
import type { CliHistoryScannerEditor, EditorCommandKey, VscodeHistoryScannerEditor } from '~/constants/codeEditor'
import type { LicenseEnum } from '~/constants/license'
import type { ProjectKind } from '~/constants/localProject'
import type { DataFileEnum } from '~/stores/helpers/persistence'
import type { LinguistResult } from '~/types/linguist'
import type { WebDavSettings } from '~/types/webdav'

export type HexColor = `#${string}`

export interface ErrorResult {
  error: string
}

export interface DialogOpenOptions {
  title?: string
}

export interface FileTypeFilter {
  name: string
  extensions: string[]
}

export interface FileDialogOptions extends DialogOpenOptions {
  fileTypes?: FileTypeFilter[]
}

export interface PathExistenceResult {
  exists: boolean
  error?: string
}

export interface OperationResult {
  success: boolean
  error?: string
}

export interface MessageResult extends OperationResult {
  message?: string
}

export interface LicenseReadResult {
  success: boolean
  filename?: string
  snippet?: string
  lines?: number
  message?: string
}

export type BasicResult = OperationResult

export interface DataResult {
  success: boolean
  data?: string
  error?: string
}

export type ProjectMutationResult = MessageResult

export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  url?: string
  name?: string
  notes?: string
  publishedAt?: string
  error?: string
}

export interface LangGroupItem {
  text: string
  color: HexColor
  percentage: number
}

export interface ScanItem {
  path: string
  name: string
  mainLang?: string
  mainLangColor?: HexColor
  langGroup?: LangGroupItem[]
  ide?: string | null
  detectedKind?: ProjectKind
  error?: string
  signature?: string
}

export interface ScanCacheEntry extends ScanItem {
  signature: string
  license?: LicenseEnum
}

export interface JetbrainsScannerPayload {
  enabled: boolean
  configRootPath: string
}

export interface RecentEditorScannerPayload {
  enabled: boolean
  stateDbPath: string
}

export interface CliEditorScannerPayload {
  enabled: boolean
  historyRootPath: string
}

export interface ScanStartPayload {
  rootsEnabled: boolean
  roots: string[]
  rootScanDepth: number
  ideEnabled: boolean
  jetbrains: JetbrainsScannerPayload
  recentEditors: Record<VscodeHistoryScannerEditor, RecentEditorScannerPayload>
  cliEditors: Record<CliHistoryScannerEditor, CliEditorScannerPayload>
  existingPaths: string[]
  cacheEntries: ScanCacheEntry[]
}

export interface ScanResult {
  items: ScanItem[]
}

export type WebDavSyncResult = MessageResult

export interface DesktopApi {
  openFolderDialog: (options?: DialogOpenOptions) => Promise<string | null>
  openFileDialog: (options?: FileDialogOptions) => Promise<string | null>

  formatPath: (filePath: string) => Promise<string>
  checkPathExistence: (path: string) => Promise<PathExistenceResult>

  analyzeProject: (folderPath: string) => Promise<LinguistResult | ErrorResult>
  getLanguageColor: (languageName: string) => Promise<HexColor | null>
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
