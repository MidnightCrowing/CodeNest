"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/* =========================
 * IPC helpers
 * ========================= */
function onIpc(channel, cb) {
    const handler = (_, data) => cb(data);
    electron_1.ipcRenderer.on(channel, handler);
    return () => electron_1.ipcRenderer.removeListener(channel, handler);
}
const api = {
    // ===== dialog =====
    openFolderDialog: (options) => electron_1.ipcRenderer.invoke('dialog:open-folder', options),
    openFileDialog: (options) => electron_1.ipcRenderer.invoke('dialog:open-file', options),
    // ===== path =====
    formatPath: (filePath) => electron_1.ipcRenderer.invoke('path:format', filePath),
    checkPathExistence: (path) => electron_1.ipcRenderer.invoke('path:check-existence', path),
    // ===== project =====
    analyzeProject: (folderPath) => electron_1.ipcRenderer.invoke('project:analyze', folderPath),
    onProjectAnalyzeProgress: (cb) => onIpc('project:analyze:progress', cb),
    readProjectLicense: (folderPath, maxLines = 20) => electron_1.ipcRenderer.invoke('project:read-license', folderPath, maxLines),
    openProject: (idePath, projectPath) => electron_1.ipcRenderer.invoke('project:open', idePath, projectPath),
    deleteProject: (projectPath) => electron_1.ipcRenderer.invoke('project:delete', projectPath),
    importProject: () => electron_1.ipcRenderer.invoke('project:import'),
    exportProject: () => electron_1.ipcRenderer.invoke('project:export'),
    // ===== data =====
    saveData: (fileType, data) => electron_1.ipcRenderer.invoke('data:save', fileType, data),
    loadData: (fileType) => electron_1.ipcRenderer.invoke('data:load', fileType),
    openData: (fileType) => electron_1.ipcRenderer.invoke('data:open', fileType),
    deleteData: (fileType) => electron_1.ipcRenderer.invoke('data:delete', fileType),
    // ===== system =====
    openExternal: (url) => electron_1.ipcRenderer.invoke('external:open', url),
    openInExplorer: (path) => electron_1.ipcRenderer.invoke('explorer:open', path),
    openInTerminal: (path) => electron_1.ipcRenderer.invoke('terminal:open', path),
    // ===== update =====
    checkUpdate: () => electron_1.ipcRenderer.invoke('update:check'),
    // ===== scanner =====
    startProjectScan: (payload) => electron_1.ipcRenderer.invoke('scanner:start', payload),
    stopProjectScan: (sessionId) => electron_1.ipcRenderer.invoke('scanner:stop', sessionId),
    onScannerItem: (cb) => onIpc('scanner:item', cb),
    onScannerDone: (cb) => onIpc('scanner:done', cb),
    onScannerError: (cb) => onIpc('scanner:error', cb),
    detectJetBrainsConfigRootPath: () => electron_1.ipcRenderer.invoke('scanner:detect-jb-config-root-path'),
    detectVscodeStateDbPath: () => electron_1.ipcRenderer.invoke('scanner:detect-vsc-state-db-path'),
    // ===== theme =====
    setWindowTheme: (currentTheme) => electron_1.ipcRenderer.invoke('theme:set', currentTheme),
};
electron_1.contextBridge.exposeInMainWorld('api', api);
