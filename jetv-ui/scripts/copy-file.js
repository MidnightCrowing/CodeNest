import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.resolve('src', 'assets', 'jet-icons.json')
const destPath = path.resolve('jet-icons.json')

fs.copyFileSync(sourcePath, destPath)
console.log('File copied successfully')
