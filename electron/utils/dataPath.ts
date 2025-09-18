import { resolve } from 'node:path'

import { app } from 'electron'

export const dataPath = app.getPath('userData')

export const projectsFilePath = resolve(dataPath, 'projects.json')
export const settingsFilePath = resolve(dataPath, 'settings.json')

export type DataFileEnum = 'editorLangGroups' | 'projects' | 'projectScanner' | 'settings'

export function getDataFilePath(fileType: DataFileEnum) {
  switch (fileType) {
    case 'projects':
      return projectsFilePath
    case 'settings':
      return settingsFilePath
    case 'projectScanner':
      return resolve(dataPath, 'projects.scanner.json')
    case 'editorLangGroups':
      return resolve(dataPath, 'language-editor-map.json')
    default:
      throw new Error(`Unknown file type: ${fileType}`)
  }
}
