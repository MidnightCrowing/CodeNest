import { resolve } from 'node:path'

import { app } from 'electron'

const appPath = app.getAppPath()
const isPackaged = app.isPackaged

export const dataPath = isPackaged ? resolve(appPath, '../data') : resolve(appPath, 'data')

export const dataFilePath = resolve(dataPath, 'projects.json')
export const settingsFilePath = resolve(dataPath, 'settings.json')
