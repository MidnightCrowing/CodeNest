import fs from 'node:fs'

import { importDirectory } from '@iconify/tools'

async function generateIconSet() {
  const iconSet = await importDirectory('./icons', {
    prefix: 'custom',
  })

  // 导出 JSON 文件
  fs.writeFileSync('./src/assets/icons.json', JSON.stringify(iconSet.export(), null, 2))
}

generateIconSet().then(() => {})
