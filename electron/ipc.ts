import { ipcMain } from 'electron'

import * as dataFile from './services/dataFileService'
import * as dialogSvc from './services/dialogService'
import * as pathSvc from './services/pathService'
import * as projectSvc from './services/projectService'
import * as scanner from './services/scannerService'
import * as systemSvc from './services/systemService'
import * as themeSvc from './services/themeService'
import * as updateSvc from './services/updateService'

// data file
ipcMain.handle('data:save', (_e, fileType, data) => dataFile.saveData(fileType, data))
ipcMain.handle('data:load', (_e, fileType) => dataFile.loadData(fileType))
ipcMain.handle('data:open', (_e, fileType) => dataFile.openData(fileType))
ipcMain.handle('data:delete', (_e, fileType) => dataFile.deleteData(fileType))

// dialog
ipcMain.handle('dialog:open-folder', (_e, options) => dialogSvc.openFolder(options))
ipcMain.handle('dialog:open-file', (_e, options) => dialogSvc.openFile(options))

// path
ipcMain.handle('path:format', (_e, filePath) => pathSvc.format(filePath))
ipcMain.handle('path:check-existence', (_e, path) => pathSvc.checkExistence(path))

// project
ipcMain.handle('project:analyze', (e, folderPath) => projectSvc.analyzeProject(e, folderPath))
ipcMain.handle('project:read-license', (_e, folderPath, maxLines) => projectSvc.readLicense(folderPath, maxLines))
ipcMain.handle('project:open', (_e, idePath, projectPath) => projectSvc.openInIDE(idePath, projectPath))
ipcMain.handle('project:delete', (_e, projectPath) => projectSvc.deleteProject(projectPath))
ipcMain.handle('project:import', () => projectSvc.importProjects())
ipcMain.handle('project:export', () => projectSvc.exportProjects())

// scanner
ipcMain.handle('scanner:start', (e, payload) => scanner.start(e, payload))
ipcMain.handle('scanner:stop', (_e, sessionId) => scanner.stop(sessionId))
ipcMain.handle('scanner:detect-jb-config-root-path', () => scanner.detectJetBrainsConfigRootPath())
ipcMain.handle('scanner:detect-vsc-state-db-path', () => scanner.detectVscodeStateDbPath())

// system
ipcMain.handle('external:open', (_e, url) => systemSvc.openExternal(url))
ipcMain.handle('explorer:open', (_e, folderPath) => systemSvc.openInExplorer(folderPath))
ipcMain.handle('terminal:open', (_e, folderPath) => systemSvc.openInTerminal(folderPath))

// theme
ipcMain.handle('theme:set', (_e, theme) => themeSvc.setTheme(theme))

// update
ipcMain.handle('update:check', () => updateSvc.checkUpdate())
