const WINDOWS_VERBATIM_UNC_RE = /^\\\\\?\\UNC\\/
const WINDOWS_VERBATIM_RE = /^\\\\\?\\/
const TRAILING_SLASH_RE = /\/+$/

/**
 * 当前是否运行在 Windows 上(路径比较时大小写不敏感)。
 * 必须在调用时求值而非模块加载时缓存:测试通过 stubGlobal 替换
 * navigator,模块级常量会在 stub 生效前被锁死为宿主平台的值。
 */
export function isWindowsPlatform(): boolean {
  // 优先使用 platform/userAgent(Tauri WebView 下可靠)。
  // 用 ^win 锚定避免 'Darwin' 误匹配。
  if (typeof navigator !== 'undefined') {
    if (navigator.platform && /^win/i.test(navigator.platform))
      return true
    if (/Windows/.test(navigator.userAgent))
      return true
  }

  // 回退到路径特征检测(import.meta.url 在打包环境可能是自定义协议)
  try {
    const testPath = new URL('.', import.meta.url).pathname
    return testPath.includes('\\') || /^\/[A-Z]:/i.test(testPath)
  }
  catch {
    return false
  }
}

/** 去除 Windows canonicalize 产生的 verbatim 前缀(`\\?\` / `\\?\UNC\`)。 */
export function stripWindowsVerbatimPrefix(path: string) {
  if (WINDOWS_VERBATIM_UNC_RE.test(path))
    return path.replace(WINDOWS_VERBATIM_UNC_RE, '\\\\')
  return path.replace(WINDOWS_VERBATIM_RE, '')
}

/**
 * 将路径归一化为可比较的 key:去 verbatim 前缀、统一斜杠、
 * 去尾部斜杠,Windows 下转小写。
 */
export function normalizePathKey(path: string) {
  const normalized = stripWindowsVerbatimPrefix(path).trim().replaceAll('\\', '/').replace(TRAILING_SLASH_RE, '')
  return isWindowsPlatform() ? normalized.toLowerCase() : normalized
}
