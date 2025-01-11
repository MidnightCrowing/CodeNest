import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setWindowTheme: (currentTheme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', currentTheme),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openFileDialog: (fileTypes: { name: string, extensions: string[] }[] = []) => ipcRenderer.invoke('open-file-dialog', fileTypes),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  formatPath: (filePath: string) => ipcRenderer.invoke('format-path', filePath),
  analyzeFolder: (folderPath: string) => ipcRenderer.invoke('analyze-folder', folderPath),
  checkPathExistence: (path: string) => ipcRenderer.invoke('check-path-existence', path),
  saveProjectData: (data: string) => ipcRenderer.invoke('save-project-data', data),
  loadProjectData: () => ipcRenderer.invoke('load-project-data'),
  saveSettingsData: (data: string) => ipcRenderer.invoke('save-settings-data', data),
  loadSettingsData: () => ipcRenderer.invoke('load-settings-data'),
  openProject: (idePath: string, projectPath: string) => ipcRenderer.invoke('open-project', idePath, projectPath),
  openInExplorer: (path: string) => ipcRenderer.invoke('open-in-explorer', path),
  openInTerminal: (path: string) => ipcRenderer.invoke('open-in-terminal', path),
  deleteProject: (projectPath: string) => ipcRenderer.invoke('delete-project', projectPath),
  importData: () => ipcRenderer.invoke('import-data'),
  exportData: () => ipcRenderer.invoke('export-data'),
  openSettingsJSON: () => ipcRenderer.invoke('open-settings-json'),
})
