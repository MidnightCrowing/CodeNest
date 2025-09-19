import type { ThemeEnum } from '~/constants/appEnums'
import type { LinguistResult } from '~/views/ProjectEditorView'

/**
 * 通用/基础类型
 */
type HexColor = `#${string}`
type Unlisten = () => void
interface ErrorResult { error: string }

/**
 * 对话框
 */
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

/**
 * 路径与文件
 */
interface PathExistenceResult {
  exists: boolean
  error?: string
}

/**
 * 项目分析
 */
type ProjectAnalyzeStage = 'start' | 'checking' | 'analyzing' | 'done'
interface ProjectAnalyzeProgress {
  folderPath: string
  stage: ProjectAnalyzeStage
}
interface LicenseReadResult {
  success: boolean
  filename?: string
  snippet?: string
  lines?: number
  message?: string
}

/**
 * 数据存取
 */
interface BasicResult {
  success: boolean
  error?: string
}
interface DataResult {
  success: boolean
  data?: string
  error?: string
}

/**
 * 数据文件类型
 */
type DataFileEnum = 'editorLangGroups' | 'projects' | 'projectScanner' | 'settings'

/**
 * 更新检查
 */
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

/**
 * 扫描（批量 & 流式）
 */
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
  error?: string
}
interface ScanStartPayload {
  roots: string[]
  existingPaths: string[]
}
interface ScanSession {
  sessionId: number
}
interface ScannerItemEvent {
  sessionId: number
  item: ScanItem
}
interface ScannerDoneEvent {
  sessionId: number
}
interface ScannerErrorEvent {
  sessionId: number
  error: string
}

declare global {
  interface Window {
    api: {
      // ========= dialog =========
      openFolderDialog: (options?: DialogOpenOptions) => Promise<string[]>
      openFileDialog: (options?: FileDialogOptions) => Promise<string[]>

      // ========= path =========
      formatPath: (filePath: string) => Promise<string>
      checkPathExistence: (path: string) => Promise<PathExistenceResult>

      // ========= project =========
      analyzeProject: (folderPath: string) => Promise<LinguistResult | ErrorResult>
      onProjectAnalyzeProgress: (cb: (data: ProjectAnalyzeProgress) => void) => Unlisten
      readProjectLicense: (folderPath: string, maxLines?: number) => Promise<LicenseReadResult>
      openProject: (idePath: string, projectPath: string) => Promise<string>
      deleteProject: (projectPath: string) => Promise<boolean>
      importProject: () => Promise<boolean>
      exportProject: () => Promise<boolean>

      // ========= data =========
      saveData: (fileType: DataFileEnum, data: string) => Promise<BasicResult>
      loadData: (fileType: DataFileEnum) => Promise<DataResult>
      openData: (fileType: DataFileEnum) => Promise<DataResult>
      deleteData: (fileType: DataFileEnum) => Promise<BasicResult>

      // ========= system =========
      openExternal: (url: string) => void
      openInExplorer: (path: string) => void
      openInTerminal: (path: string) => void

      // ========= update =========
      checkUpdate: () => Promise<UpdateCheckResult>

      // ========= scanner (batch) =========
      scanProjects: (payload: { roots: string[], existingPaths: string[] }) => Promise<ScanItem[]>

      // ========= scanner (stream) =========
      startProjectScan: (payload: ScanStartPayload) => Promise<ScanSession>
      stopProjectScan: (sessionId: number) => Promise<{ stopped: boolean }>
      onScannerItem: (cb: (data: ScannerItemEvent) => void) => Unlisten
      onScannerDone: (cb: (data: ScannerDoneEvent) => void) => Unlisten
      onScannerError: (cb: (data: ScannerErrorEvent) => void) => Unlisten
      detectVscodeStateDbPath: () => Promise<string | null>

      // ========= theme =========
      setWindowTheme: (currentTheme: ThemeEnum) => void
    }
  }
}

export {}
