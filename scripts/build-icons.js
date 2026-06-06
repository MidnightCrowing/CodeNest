import fs from 'node:fs'
import process from 'node:process'

import { importDirectory } from '@iconify/tools'

async function generateIconSet() {
  const iconSet = await importDirectory('./icons', {
    prefix: 'custom',
  })

  fs.writeFileSync('./src/assets/icons.json', `${JSON.stringify(iconSet.export(), null, 2)}\n`)
}

generateIconSet().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
