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

  function loadCached(): T | null {
    try {
      const raw = window.localStorage.getItem(cacheKey)
      return raw ? deserialize(raw) : null
    }
    catch (e) {
      console.error(`Error reading '${options.key}' cache:`, e)
      return null
    }
  }

  function saveCache(data: T): void {
    try {
      window.localStorage.setItem(cacheKey, serialize(data))
    }
    catch (e) {
      console.error(`Error writing '${options.key}' cache:`, e)
    }
  }

  function clearCache(): void {
    try {
      window.localStorage.removeItem(cacheKey)
    }
    catch (e) {
      console.error(`Error clearing '${options.key}' cache:`, e)
    }
  }

  async function load(): Promise<T | null> {
    const result = await window.api.loadData(options.key)
    if (result.success && result.data) {
      try {
        const data = deserialize(result.data)
        try {
          window.localStorage.setItem(cacheKey, result.data)
        }
        catch (e) {
          console.error(`Error writing '${options.key}' cache:`, e)
        }
        return data
      }
      catch (e) {
        console.error(`Error parsing '${options.key}' data:`, e)
      }
    }
    clearCache()
    return null
  }

  async function save(data: T): Promise<void> {
    saveCache(data)
    await window.api.saveData(options.key, serialize(data))
  }

  return { clearCache, load, loadCached, save, saveCache }
}
