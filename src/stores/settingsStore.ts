import { defineStore } from 'pinia'

import { LanguageEnum, ThemeEnum } from '~/constants/appEnums'
import { CodeEditorEnum, codeEditors } from '~/constants/codeEditor'
import { createPersistence } from '~/stores/helpers/persistence'

const settingsPersistence = createPersistence<any>({
  key: 'settings',
})

export const useSettingsStore = defineStore('settings', () => {
  // --- 配置项 ---
  const theme = ref<ThemeEnum>(ThemeEnum.Light)
  const language = ref<LanguageEnum>(LanguageEnum.English)
  const codeEditorsPath = reactive<Record<CodeEditorEnum, string>>(
    Object.fromEntries(Object.keys(codeEditors).map(key => [key, ''])) as Record<CodeEditorEnum, string>,
  )
  const projectScannerRoots = ref<string[]>([])
  const projectScannerOpenMode = ref<'auto' | 'specified'>('auto')
  const projectScannerEditor = ref<CodeEditorEnum>(CodeEditorEnum.VisualStudioCode)
  const projectScannerNamePattern = ref<string>('(demo|test)')

  // --- 加载配置 ---
  async function loadSettings(): Promise<void> {
    try {
      const loadedData = await settingsPersistence.load()
      if (loadedData) {
        theme.value = loadedData.theme ?? theme.value
        language.value = loadedData.language ?? language.value
        projectScannerRoots.value = Array.isArray(loadedData.projectScannerRoots)
          ? loadedData.projectScannerRoots
          : []
        projectScannerOpenMode.value
          = loadedData.projectScannerOpenMode ?? projectScannerOpenMode.value
        projectScannerEditor.value = loadedData.projectScannerEditor ?? projectScannerEditor.value
        projectScannerNamePattern.value
          = loadedData.projectScannerNamePattern ?? projectScannerNamePattern.value

        if (loadedData.codeEditorsPath) {
          for (const editor of Object.keys(codeEditorsPath) as CodeEditorEnum[]) {
            codeEditorsPath[editor] = loadedData.codeEditorsPath[editor] ?? ''
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
        projectScannerRoots: projectScannerRoots.value,
        projectScannerOpenMode: projectScannerOpenMode.value,
        projectScannerEditor: projectScannerEditor.value,
        projectScannerNamePattern: projectScannerNamePattern.value,
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
    projectScannerRoots,
    projectScannerOpenMode,
    projectScannerEditor,
    projectScannerNamePattern,
    loadSettings,
    saveSettings,
  }
})
