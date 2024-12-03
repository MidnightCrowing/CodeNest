import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.join(__dirname, 'src', 'assets', 'jet-icons.json')
const destPath = path.join(__dirname, 'jet-icons.json')

fs.copyFileSync(sourcePath, destPath)
console.log('File copied successfully')