import { defineStore } from 'pinia'

import { LanguageEnum, ThemeEnum } from '~/constants/appEnums'
import { CodeEditorEnum, codeEditors } from '~/constants/codeEditor'

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
      const result = await window.api.loadData('settings')
      if (result.success && result.data) {
        const loadedData = JSON.parse(result.data)

        theme.value = loadedData.theme ?? theme.value
        language.value = loadedData.language ?? language.value
        projectScannerRoots.value = Array.isArray(loadedData.projectScannerRoots)
          ? loadedData.projectScannerRoots
          : []
        projectScannerOpenMode.value = loadedData.projectScannerOpenMode ?? projectScannerOpenMode.value
        projectScannerEditor.value = loadedData.projectScannerEditor ?? projectScannerEditor.value
        projectScannerNamePattern.value = loadedData.projectScannerNamePattern ?? projectScannerNamePattern.value

        if (loadedData.codeEditorsPath) {
          for (const editor of Object.keys(codeEditorsPath) as CodeEditorEnum[]) {
            codeEditorsPath[editor] = loadedData.codeEditorsPath[editor] ?? ''
          }
        }
      }
    }
    catch (error: any) {
      console.error('Error loading settings data:', error)
    }
  }

  // --- 保存配置 ---
  async function saveSettings(): Promise<void> {
    try {
      const dataToSave = JSON.stringify({
        theme: theme.value,
        language: language.value,
        codeEditorsPath,
        projectScannerRoots: projectScannerRoots.value,
        projectScannerOpenMode: projectScannerOpenMode.value,
        projectScannerEditor: projectScannerEditor.value,
        projectScannerNamePattern: projectScannerNamePattern.value,
      })
      await window.api.saveData('settings', dataToSave)
    }
    catch (error: any) {
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
