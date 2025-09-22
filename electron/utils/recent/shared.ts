import fs from 'node:fs'
import path from 'node:path'

export function uniqExistingDirs(
  paths: { path: string, ide: string | null }[],
): { path: string, ide: string | null }[] {
  const seen = new Set<string>()
  const out: { path: string, ide: string | null }[] = []
  for (const item of paths) {
    const p = item.path
    if (!p)
      continue
    let fp = p
    // Normalize windows backslashes, remove trailing slashes
    fp = path.normalize(fp)

    try {
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) {
        // 统一大小写来判断唯一性（比如统一转小写）
        const key = fp.toLowerCase()

        if (!seen.has(key)) {
          seen.add(key)

          // 输出时修正盘符大写（只改第一个字母）
          if (/^[a-z]:/.test(fp)) {
            fp = fp.charAt(0).toUpperCase() + fp.slice(1)
          }

          out.push({ path: fp, ide: item.ide })
        }
      }
    }
    catch {}
  }
  return out
}
