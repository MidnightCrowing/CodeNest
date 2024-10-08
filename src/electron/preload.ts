import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setWindowTheme: (currentTheme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', currentTheme),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
})
