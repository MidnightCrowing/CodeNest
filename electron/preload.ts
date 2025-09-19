import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // dialog
  openFolderDialog: (options?: {
    title?: string
  }) => ipcRenderer.invoke('dialog:open-folder', options),
  openFileDialog: (options?: {
    title?: string
    fileTypes?: { name: string, extensions: string[] }[]
  }) => ipcRenderer.invoke('dialog:open-file', options),

  // path
  formatPath: (filePath: string) => ipcRenderer.invoke('path:format', filePath),
  checkPathExistence: (path: string) => ipcRenderer.invoke('path:check-existence', path),

  // project
  analyzeProject: (folderPath: string) => ipcRenderer.invoke('project:analyze', folderPath),
  onProjectAnalyzeProgress: (cb: (data: { folderPath: string, stage: 'start' | 'checking' | 'analyzing' | 'done' }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on('project:analyze:progress', handler)
    return () => ipcRenderer.removeListener('project:analyze:progress', handler)
  },
  readProjectLicense: (folderPath: string, maxLines = 20) => ipcRenderer.invoke('project:read-license', folderPath, maxLines),
  openProject: (idePath: string, projectPath: string) => ipcRenderer.invoke('project:open', idePath, projectPath),
  deleteProject: (projectPath: string) => ipcRenderer.invoke('project:delete', projectPath),
  importProject: () => ipcRenderer.invoke('project:import'),
  exportProject: () => ipcRenderer.invoke('project:export'),

  // settings
  openSettingsJSON: () => ipcRenderer.invoke('settings:open-json'),

  // data
  saveData: (fileType: string, data: string) => ipcRenderer.invoke('data:save', fileType, data),
  loadData: (fileType: string) => ipcRenderer.invoke('data:load', fileType),
  deleteData: (fileType: string) => ipcRenderer.invoke('data:delete', fileType),

  // system
  openExternal: (url: string) => ipcRenderer.invoke('external:open', url),
  openInExplorer: (path: string) => ipcRenderer.invoke('explorer:open', path),
  openInTerminal: (path: string) => ipcRenderer.invoke('terminal:open', path),

  // update
  checkUpdate: () => ipcRenderer.invoke('update:check'),

  // scanner (batch)
  scanProjects: (payload: { roots: string[], existingPaths: string[] }) => ipcRenderer.invoke('scanner:scan', payload),
  // scanner (stream)
  startProjectScan: (payload: { roots: string[], existingPaths: string[] }) => ipcRenderer.invoke('scanner:start', payload),
  stopProjectScan: (sessionId: number) => ipcRenderer.invoke('scanner:stop', sessionId),
  onScannerItem: (cb: (data: { sessionId: number, item: any }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on('scanner:item', handler)
    return () => ipcRenderer.removeListener('scanner:item', handler)
  },
  onScannerDone: (cb: (data: { sessionId: number }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on('scanner:done', handler)
    return () => ipcRenderer.removeListener('scanner:done', handler)
  },
  onScannerError: (cb: (data: { sessionId: number, error: string }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on('scanner:error', handler)
    return () => ipcRenderer.removeListener('scanner:error', handler)
  },
  detectVscodeStateDbPath: () => ipcRenderer.invoke('scanner:detect-vsc-state-db-path'),

  // theme
  setWindowTheme: (currentTheme: 'light' | 'dark') => ipcRenderer.invoke('theme:set', currentTheme),
})
