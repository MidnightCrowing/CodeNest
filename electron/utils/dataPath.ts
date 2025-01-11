import { homedir } from 'node:os'
import { resolve } from 'node:path'

const userHome = homedir()
export const dataPath = resolve(userHome, '.codenest')

export const dataFilePath = resolve(dataPath, 'projects.json')
export const settingsFilePath = resolve(dataPath, 'settings.json')
