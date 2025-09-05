import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // dialog
  openFolderDialog: () => ipcRenderer.invoke('dialog:open-folder'),
  openFileDialog: (fileTypes: { name: string, extensions: string[] }[] = []) => ipcRenderer.invoke('dialog:open-file', fileTypes),

  // folder
  getFolderList: (folderPath: string) => ipcRenderer.invoke('folder:get-list', folderPath),

  // path
  formatPath: (filePath: string) => ipcRenderer.invoke('path:format', filePath),
  checkPathExistence: (path: string) => ipcRenderer.invoke('path:check-existence', path),

  // project
  analyzeProject: (folderPath: string) => ipcRenderer.invoke('project:analyze', folderPath),
  saveProjectData: (data: string) => ipcRenderer.invoke('project:save-data', data),
  loadProjectData: () => ipcRenderer.invoke('project:load-data'),
  openProject: (idePath: string, projectPath: string) => ipcRenderer.invoke('project:open', idePath, projectPath),
  deleteProject: (projectPath: string) => ipcRenderer.invoke('project:delete', projectPath),
  importProject: () => ipcRenderer.invoke('project:import'),
  exportProject: () => ipcRenderer.invoke('project:export'),

  // settings
  saveSettingsData: (data: string) => ipcRenderer.invoke('settings:save', data),
  loadSettingsData: () => ipcRenderer.invoke('settings:load'),
  openSettingsJSON: () => ipcRenderer.invoke('settings:open-json'),

  // system
  openExternal: (url: string) => ipcRenderer.invoke('external:open', url),
  openInExplorer: (path: string) => ipcRenderer.invoke('explorer:open', path),
  openInTerminal: (path: string) => ipcRenderer.invoke('terminal:open', path),

  // theme
  setWindowTheme: (currentTheme: 'light' | 'dark') => ipcRenderer.invoke('theme:set', currentTheme),
})
