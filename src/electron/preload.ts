import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setWindowTheme: (currentTheme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', currentTheme),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openFileDialog: (fileTypes: { name: string, extensions: string[] }[] = []) => ipcRenderer.invoke('open-file-dialog', fileTypes),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  analyzeFolder: (folderPath: string) => ipcRenderer.invoke('analyze-folder', folderPath),
  saveProjectData: (data: string) => ipcRenderer.invoke('save-project-data', data),
  loadProjectData: () => ipcRenderer.invoke('load-project-data'),
  saveSettingsData: (data: string) => ipcRenderer.invoke('save-settings-data', data),
  loadSettingsData: () => ipcRenderer.invoke('load-settings-data'),
  openSettingsJSON: () => ipcRenderer.invoke('open-settings-json'),
})
