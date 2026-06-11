/**
 * 数据文件类型
 */
export type DataFileEnum = 'editorLangGroups' | 'projects' | 'projectScanner' | 'settings'

export interface PersistenceOptions<T> {
  key: DataFileEnum
  serialize?: (data: T) => string
  deserialize?: (raw: string) => T
}

export function createPersistence<T>(options: PersistenceOptions<T>) {
  const serialize = options.serialize ?? ((data: T) => JSON.stringify(data))
  const deserialize = options.deserialize ?? ((raw: string) => JSON.parse(raw) as T)
  const cacheKey = `codenest:data:${options.key}`

  function deserializeSafely(raw: string, source: 'cache' | 'disk'): T | null {
    try {
      return deserialize(raw)
    }
    catch (e: unknown) {
      console.error(`Error parsing '${options.key}' ${source} data:`, e)
      return null
    }
  }

  function loadCached(): T | null {
    try {
      const raw = window.localStorage.getItem(cacheKey)
      return raw ? deserializeSafely(raw, 'cache') : null
    }
    catch (e: unknown) {
      console.error(`Error reading '${options.key}' cache:`, e)
      return null
    }
  }

  function saveSerializedCache(raw: string): void {
    try {
      window.localStorage.setItem(cacheKey, raw)
    }
    catch (e: unknown) {
      console.error(`Error writing '${options.key}' cache:`, e)
    }
  }

  function saveCache(data: T): void {
    saveSerializedCache(serialize(data))
  }

  function clearCache(): void {
    try {
      window.localStorage.removeItem(cacheKey)
    }
    catch (e: unknown) {
      console.error(`Error clearing '${options.key}' cache:`, e)
    }
  }

  async function load(): Promise<T | null> {
    const cachedData = loadCached()
    let result
    try {
      result = await window.api.loadData(options.key)
    }
    catch (e: unknown) {
      console.error(`Error loading '${options.key}' data from disk:`, e)
      return cachedData
    }

    if (result.success && result.data) {
      const data = deserializeSafely(result.data, 'disk')
      if (data) {
        saveSerializedCache(result.data)
        return data
      }
    }

    if (result.error)
      console.error(`Error loading '${options.key}' data:`, result.error)
    return cachedData
  }

  async function save(data: T): Promise<void> {
    const raw = serialize(data)
    try {
      const result = await window.api.saveData(options.key, raw)
      if (!result.success) {
        // 磁盘保存失败时仍写入缓存:load() 在磁盘读取失败时会回退到
        // 缓存,这让用户数据在磁盘故障(如磁盘满)时仍有恢复机会。
        saveSerializedCache(raw)
        throw new Error(result.error || `Failed to save '${options.key}' data`)
      }
      saveSerializedCache(raw)
    }
    catch (e: unknown) {
      saveSerializedCache(raw)
      throw e
    }
  }

  return { clearCache, load, loadCached, save, saveCache }
}
