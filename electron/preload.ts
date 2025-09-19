import { contextBridge, ipcRenderer } from 'electron'

/* =========================
 * Shared types
 * ========================= */
type Unlisten = () => void

interface DialogOpenOptions {
  title?: string
}
interface FileTypeFilter { name: string, extensions: string[] }
type FileDialogOptions = DialogOpenOptions & {
  fileTypes?: FileTypeFilter[]
}

type ProjectAnalyzeStage = 'start' | 'checking' | 'analyzing' | 'done'
interface ProjectAnalyzeProgress {
  folderPath: string
  stage: ProjectAnalyzeStage
}

interface ScanStartPayload { roots: string[], existingPaths: string[] }
interface ScannerItemEvent { sessionId: number, item: any }
interface ScannerDoneEvent { sessionId: number }
interface ScannerErrorEvent { sessionId: number, error: string }

/* =========================
 * IPC helpers
 * ========================= */
function onIpc<T>(channel: string, cb: (data: T) => void): Unlisten {
  const handler = (_: unknown, data: T) => cb(data)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

const api = {
  // ===== dialog =====
  openFolderDialog: (options?: DialogOpenOptions) =>
    ipcRenderer.invoke('dialog:open-folder', options),

  openFileDialog: (options?: FileDialogOptions) =>
    ipcRenderer.invoke('dialog:open-file', options),

  // ===== path =====
  formatPath: (filePath: string) => ipcRenderer.invoke('path:format', filePath),

  checkPathExistence: (path: string) =>
    ipcRenderer.invoke('path:check-existence', path),

  // ===== project =====
  analyzeProject: (folderPath: string) =>
    ipcRenderer.invoke('project:analyze', folderPath),

  onProjectAnalyzeProgress: (cb: (data: ProjectAnalyzeProgress) => void): Unlisten =>
    onIpc('project:analyze:progress', cb),

  readProjectLicense: (folderPath: string, maxLines = 20) =>
    ipcRenderer.invoke('project:read-license', folderPath, maxLines),

  openProject: (idePath: string, projectPath: string) =>
    ipcRenderer.invoke('project:open', idePath, projectPath),

  deleteProject: (projectPath: string) =>
    ipcRenderer.invoke('project:delete', projectPath),

  importProject: () => ipcRenderer.invoke('project:import'),

  exportProject: () => ipcRenderer.invoke('project:export'),

  // ===== data =====
  saveData: (fileType: string, data: string) =>
    ipcRenderer.invoke('data:save', fileType, data),

  loadData: (fileType: string) => ipcRenderer.invoke('data:load', fileType),

  openData: (fileType: string) => ipcRenderer.invoke('data:open', fileType),

  deleteData: (fileType: string) => ipcRenderer.invoke('data:delete', fileType),

  // ===== system =====
  openExternal: (url: string) => ipcRenderer.invoke('external:open', url),

  openInExplorer: (path: string) => ipcRenderer.invoke('explorer:open', path),

  openInTerminal: (path: string) => ipcRenderer.invoke('terminal:open', path),

  // ===== update =====
  checkUpdate: () => ipcRenderer.invoke('update:check'),

  // ===== scanner (batch) =====
  scanProjects: (payload: ScanStartPayload) =>
    ipcRenderer.invoke('scanner:scan', payload),

  // ===== scanner (stream) =====
  startProjectScan: (payload: ScanStartPayload) =>
    ipcRenderer.invoke('scanner:start', payload),

  stopProjectScan: (sessionId: number) =>
    ipcRenderer.invoke('scanner:stop', sessionId),

  onScannerItem: (cb: (data: ScannerItemEvent) => void): Unlisten =>
    onIpc('scanner:item', cb),

  onScannerDone: (cb: (data: ScannerDoneEvent) => void): Unlisten =>
    onIpc('scanner:done', cb),

  onScannerError: (cb: (data: ScannerErrorEvent) => void): Unlisten =>
    onIpc('scanner:error', cb),

  detectVscodeStateDbPath: () =>
    ipcRenderer.invoke('scanner:detect-vsc-state-db-path'),

  // ===== theme =====
  setWindowTheme: (currentTheme: 'light' | 'dark') =>
    ipcRenderer.invoke('theme:set', currentTheme),
} as const

contextBridge.exposeInMainWorld('api', api)
