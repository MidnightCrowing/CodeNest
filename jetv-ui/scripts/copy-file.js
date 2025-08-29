import fs from 'node:fs'

const sourcePath = './src/assets/jet-icons.json'
const destPath = './dist/jet-icons.json'

fs.copyFileSync(sourcePath, destPath)
console.log('File copied successfully')
