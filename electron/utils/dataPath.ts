import { resolve } from 'node:path'

import { app } from 'electron'

export const dataPath = app.getPath('userData')

export const projectsFilePath = resolve(dataPath, 'projects.json')
export const settingsFilePath = resolve(dataPath, 'settings.json')
