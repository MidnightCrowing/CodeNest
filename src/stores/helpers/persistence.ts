export interface PersistenceOptions<T> {
  key: 'editorLangGroups' | 'projects' | 'projectScanner' | 'settings'
  serialize?: (data: T) => string
  deserialize?: (raw: string) => T
}

export function createPersistence<T>(options: PersistenceOptions<T>) {
  const serialize = options.serialize ?? ((data: T) => JSON.stringify(data))
  const deserialize = options.deserialize ?? ((raw: string) => JSON.parse(raw) as T)

  async function load(): Promise<T | null> {
    const result = await window.api.loadData(options.key)
    if (result.success && result.data) {
      try {
        return deserialize(result.data)
      }
      catch (e) {
        console.error(`Error parsing '${options.key}' data:`, e)
      }
    }
    return null
  }

  async function save(data: T): Promise<void> {
    await window.api.saveData(options.key, serialize(data))
  }

  return { load, save }
}
