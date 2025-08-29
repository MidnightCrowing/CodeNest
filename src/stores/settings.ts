import { defineStore } from 'pinia'

import { LanguageEnum, ThemeEnum } from '~/constants/appEnums'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'

export const useSettingsStore = defineStore('settings', () => {
  // --- 配置项 ---
  const theme = ref<ThemeEnum>(ThemeEnum.Light)
  const language = ref<LanguageEnum>(LanguageEnum.English)
  const codeEditorsPath = reactive<Record<CodeEditorEnum, string>>(
    Object.fromEntries(Object.keys(codeEditors).map(key => [key, ''])) as Record<CodeEditorEnum, string>,
  )

  // --- 加载配置 ---
  async function loadSettings(): Promise<void> {
    try {
      const result = await window.api.loadSettingsData()
      if (result.success && result.data) {
        const loadedData = JSON.parse(result.data)

        theme.value = loadedData.theme ?? theme.value
        language.value = loadedData.language ?? language.value

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
      })
      await window.api.saveSettingsData(dataToSave)
    }
    catch (error: any) {
      console.error('Error saving settings data:', error)
    }
  }

  return {
    theme,
    language,
    codeEditorsPath,
    loadSettings,
    saveSettings,
  }
})
