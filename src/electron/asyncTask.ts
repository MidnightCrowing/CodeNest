import { resolve } from 'node:path'

import fs from 'fs-extra'

import { dataPath } from './dataPath.js'

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  }
  catch {
    return false
  }
}

async function createFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf8')
  }
  catch (error) {
    console.error(`Error creating file: ${error}`)
  }
}

async function a() {
  const filePath = resolve(dataPath, 'languages.yml')
  const result = await checkFileExists(filePath)

  await createFile(resolve(dataPath, 'result.txt'), result.toString())
}

export async function performAsyncTask() {
  await a()
//   // 模拟异步操作，例如读取文件、网络请求等
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       console.log('finish')
//       resolve('result-')
//     }, 20000)
//   })
}
