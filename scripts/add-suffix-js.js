import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

void (async function () {
  try {
    const rootPath = path.resolve(__dirname, '../dist/electron')
    const paths = await fs.readdir(rootPath)
    const stack = [...paths]

    while (stack.length) {
      const top = stack.pop()
      const filePath = path.resolve(rootPath, top)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        const subPaths = await fs.readdir(filePath)
        for (const subPath of subPaths) {
          stack.push(path.join(top, subPath))
        }
      }
      else {
        let fileContent = await fs.readFile(filePath, { encoding: 'utf8' })

        // 正则表达式更新为匹配所有类型的导入，包括简单导入和带路径的导入
        const regexpNames = /(?:import\s+(?:(?:\{.*?\}|\*\s+as\s+\S+|\S+)\s*)?from\s*["'](.+?)["']|import\s+["'](.+?)["']);/g
        const matches = [...fileContent.matchAll(regexpNames)]

        // 处理匹配项，逆序替换避免索引偏移问题
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i]
          const [fullMatch, modulePath, simplePath] = match

          // 选择路径进行替换（如果有路径）
          const pathToReplace = modulePath || simplePath

          // 只处理相对路径且不以 .js 结尾的导入路径
          if (pathToReplace && pathToReplace.startsWith('.') && !pathToReplace.endsWith('.js')) {
            const updatedMatch = fullMatch.replace(pathToReplace, `${pathToReplace}.js`)
            const startIndex = match.index
            const endIndex = startIndex + fullMatch.length

            // 替换文件内容
            fileContent = fileContent.slice(0, startIndex) + updatedMatch + fileContent.slice(endIndex)
          }
        }

        await fs.writeFile(filePath, fileContent, { encoding: 'utf8' })
      }
    }
  }
  catch (error) {
    console.error(error)
  }
})()
