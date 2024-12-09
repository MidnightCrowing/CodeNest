import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'

interface SettingsData {
  theme: string
  language: string
  codeEditorsPath: Record<CodeEditorEnum, string>
  // 可以扩展更多设置项
  [key: string]: any
}

class Settings {
  private readonly settingsData: SettingsData

  constructor() {
    this.settingsData = {
      theme: 'light',
      language: 'en',
      codeEditorsPath: Object.fromEntries(
        Object.keys(codeEditors).map(key => [key, '']),
      ) as Record<CodeEditorEnum, string>,
      // 初始化其他设置项
    }

    // 加载设置
    this.loadSettings().then()
  }

  // 保存设置到本地文件
  async saveSettings(): Promise<void> {
    try {
      const dataToSave = JSON.stringify(this.settingsData)
      await window.api.saveSettingsData(dataToSave)
    }
    catch (error: any) {
      console.error('Error saving settings data:', error)
    }
  }

  // 从本地文件加载设置
  async loadSettings(): Promise<void> {
    try {
      const result = await window.api.loadSettingsData()
      if (result.success && result.data) {
        const loadedData: Partial<SettingsData> = JSON.parse(result.data)

        // 遍历现有的设置结构，动态适配加载的数据
        for (const key of Object.keys(this.settingsData)) {
          switch (key) {
            case 'theme':
            case 'language':
              this.settingsData[key] = loadedData[key] ?? this.settingsData[key]
              break

            // codeEditorsPath 设置项处理
            case 'codeEditorsPath': {
              // 特殊处理 `codeEditorsPath`：以默认结构为准，补全缺失键，忽略多余键
              const defaultPaths = this.settingsData.codeEditorsPath
              const loadedPaths = (loadedData.codeEditorsPath || {}) as Record<CodeEditorEnum, string>

              this.settingsData.codeEditorsPath = Object.keys(defaultPaths).reduce(
                (adapted: Record<CodeEditorEnum, string>, editor: string) => {
                  adapted[editor as CodeEditorEnum] = loadedPaths[editor as CodeEditorEnum] ?? ''
                  return adapted
                },
                {} as Record<CodeEditorEnum, string>,
              )
              break
            }

            // 通用处理：覆盖现有值，未定义的键保持默认
            default: {
              this.settingsData[key] = loadedData[key] ?? this.settingsData[key]
              break
            }
          }
        }
      }
    }
    catch (error: any) {
      console.error('Error loading settings data:', error)
    }
  }

  // 获取某个设置项
  getSetting<T extends keyof SettingsData>(key: T): SettingsData[T] {
    return this.settingsData[key]
  }

  // 更新某个设置项
  updateSetting<T extends keyof SettingsData>(key: T, value: SettingsData[T]): void {
    if (key in this.settingsData) {
      this.settingsData[key] = value
    }
    else {
      console.warn(`Setting key "${key}" is not recognized.`)
    }
  }

  // 获取所有设置项
  getSettings(): SettingsData {
    return this.settingsData
  }
}

export const settings = new Settings()
