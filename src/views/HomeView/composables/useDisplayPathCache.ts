import { reactive } from 'vue'

const CACHE_LIMIT = 1000

export function useDisplayPathCache() {
  const cache = reactive(new Map<string, string>())
  const pendingPaths = new Set<string>()

  function displayProjectPath(path: string): string {
    return cache.get(path) ?? path
  }

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
      cache.set(path, path)
    }
    finally {
      pendingPaths.delete(path)
    }
  }

  /** 超限时优先丢掉当前列表中不存在的条目 */
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
