import { reactive } from 'vue'

/**
 * 路径显示缓存
 *
 * 将原始路径缓存为格式化的显示路径（如 Windows 的 \\?\ 前缀剥离）。
 * 缓存命中时避免重复调用 Tauri 后端的 formatPath。
 */

const CACHE_LIMIT = 1000

export function useDisplayPathCache() {
  const cache = reactive(new Map<string, string>())
  const pendingPaths = new Set<string>()

  /**
   * 获取路径的显示形式
   * @param path 原始路径
   * @returns 格式化后的路径，若未缓存则返回原始路径
   */
  function displayProjectPath(path: string): string {
    return cache.get(path) ?? path
  }

  /**
   * 异步缓存路径的格式化结果
   * @param path 需要格式化的路径
   */
  async function cacheDisplayPath(path: string): Promise<void> {
    if (!path || cache.has(path) || pendingPaths.has(path))
      return

    pendingPaths.add(path)
    try {
      const formattedPath = await window.api.formatPath(path)
      cache.set(path, formattedPath || path)
    }
    catch (error) {
      console.error('Failed to format project path:', error)
      cache.set(path, path) // 失败时使用原始路径
    }
    finally {
      pendingPaths.delete(path)
    }
  }

  /**
   * 缓存超限时清理不在当前项目列表中的条目
   * @param livePaths 当前存活的路径集合
   */
  function pruneCache(livePaths: Set<string>): void {
    if (cache.size <= CACHE_LIMIT)
      return

    for (const path of cache.keys()) {
      if (!livePaths.has(path))
        cache.delete(path)
    }
  }

  return {
    displayProjectPath,
    cacheDisplayPath,
    pruneCache,
  }
}
