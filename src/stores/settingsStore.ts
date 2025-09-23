import { defineStore } from 'pinia'

import { LanguageEnum, ThemeEnum } from '~/constants/appEnums'
import { CodeEditorEnum, codeEditors } from '~/constants/codeEditor'
import { createPersistence } from '~/stores/helpers/persistence'

const settingsPersistence = createPersistence<any>({
  key: 'settings',
})

// Scanner settings shape
export interface ScannerSettings {
  // file system roots scanning
  rootsEnabled: boolean
  roots: string[]

  // IDE scanning toggles
  ideEnabled: boolean
  jetbrains: {
    enabled: boolean
    configRootPath: string
  }
  vscode: {
    enabled: boolean
    stateDbPath: string
  }
  visualStudio: {
    enabled: boolean
  }

  // import strategies
  openMode: 'auto' | 'specified'
  editor: CodeEditorEnum
  namePattern: string
}

export const useSettingsStore = defineStore('settings', () => {
  // --- 基础配置项 ---
  const theme = ref<ThemeEnum>(ThemeEnum.Light)
  const language = ref<LanguageEnum>(LanguageEnum.English)
  const codeEditorsPath = reactive<Record<CodeEditorEnum, string>>(
    Object.fromEntries(Object.keys(codeEditors).map(key => [key, ''])) as Record<CodeEditorEnum, string>,
  )

  // --- 扫描器配置 ---
  const scanner = reactive<ScannerSettings>({
    rootsEnabled: false,
    roots: [],

    ideEnabled: false,
    jetbrains: {
      enabled: false,
      configRootPath: '',
    },
    vscode: {
      enabled: false,
      stateDbPath: '',
    },
    visualStudio: {
      enabled: false,
    },

    openMode: 'auto',
    editor: CodeEditorEnum.VisualStudioCode,
    namePattern: '(demo|test)',
  })

  // --- 加载配置 ---
  async function loadSettings(): Promise<void> {
    try {
      const loadedData = await settingsPersistence.load()
      if (loadedData) {
        theme.value = loadedData.theme ?? theme.value
        language.value = loadedData.language ?? language.value

        // editors path
        if (loadedData.codeEditorsPath) {
          for (const editor of Object.keys(codeEditorsPath) as CodeEditorEnum[]) {
            codeEditorsPath[editor] = loadedData.codeEditorsPath[editor] ?? ''
          }
        }

        // scanner
        if (loadedData.scanner) {
          const s = loadedData.scanner as Partial<ScannerSettings>
          // primitives
          if (typeof s.rootsEnabled === 'boolean')
            scanner.rootsEnabled = s.rootsEnabled
          if (Array.isArray(s.roots))
            scanner.roots.splice(0, scanner.roots.length, ...s.roots)
          if (typeof s.ideEnabled === 'boolean')
            scanner.ideEnabled = s.ideEnabled
          if (s.openMode === 'auto' || s.openMode === 'specified')
            scanner.openMode = s.openMode
          if (s.editor)
            scanner.editor = s.editor
          if (typeof s.namePattern === 'string')
            scanner.namePattern = s.namePattern

          // nested
          if (s.jetbrains) {
            scanner.jetbrains.enabled = s.jetbrains.enabled
            scanner.jetbrains.configRootPath = s.jetbrains.configRootPath
          }
          if (s.vscode) {
            scanner.vscode.enabled = s.vscode.enabled
            scanner.vscode.stateDbPath = s.vscode.stateDbPath
          }
          if (s.visualStudio) {
            scanner.visualStudio.enabled = s.visualStudio.enabled
          }
        }
      }
    }
    catch (error) {
      console.error('Error loading settings data:', error)
    }
  }

  // --- 保存配置 ---
  async function saveSettings(): Promise<void> {
    try {
      await settingsPersistence.save({
        theme: theme.value,
        language: language.value,
        codeEditorsPath,
        scanner,
      })
    }
    catch (error) {
      console.error('Error saving settings data:', error)
    }
  }

  return {
    theme,
    language,
    codeEditorsPath,
    scanner,
    loadSettings,
    saveSettings,
  }
})
