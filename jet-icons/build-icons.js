import fs from 'node:fs'

import { importDirectory } from '@iconify/tools'

async function generateIconSet() {
  const iconSet = await importDirectory('./jet-icons/icons', {
    prefix: 'jet',
  })

  // 导出 JSON 文件
  fs.writeFileSync('./jet-icons/jet-icons.json', JSON.stringify(iconSet.export(), null, 2))
}

generateIconSet().then(() => {})
