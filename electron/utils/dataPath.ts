import { resolve } from 'node:path'

import { app } from 'electron'

export const dataPath = app.getPath('userData')

export const projectsFilePath = resolve(dataPath, 'projects.json')
export const projectScannerFilePath = resolve(dataPath, 'projects.scanner.json')
export const settingsFilePath = resolve(dataPath, 'settings.json')

export type DataFileEnum = 'projects' | 'projectScanner' | 'settings'

export function getDataFilePath(fileType: DataFileEnum) {
  switch (fileType) {
    case 'projects':
      return projectsFilePath
    case 'projectScanner':
      return projectScannerFilePath
    case 'settings':
      return settingsFilePath
    default:
      throw new Error(`Unknown file type: ${fileType}`)
  }
}
