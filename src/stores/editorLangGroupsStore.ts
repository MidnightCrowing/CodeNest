import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { CodeEditorEnum } from '~/constants/codeEditor'
import { defaultEditorLangGroups } from '~/constants/codeEditor'
import { createPersistence } from '~/stores/helpers/persistence'

const groupsPersistence = createPersistence<Record<CodeEditorEnum, string[]>>({
  key: 'editorLangGroups',
})

export const useEditorLangGroupsStore = defineStore('editorLangGroups', () => {
  const groups = ref<Record<CodeEditorEnum, string[]>>(defaultEditorLangGroups)

  function getEditorByLanguage(
    lang: string,
    fallback: CodeEditorEnum | null = null,
  ): CodeEditorEnum | null {
    lang = lang.toLowerCase()
    for (const [editor, langs] of Object.entries(groups.value)) {
      if (langs.includes(lang)) {
        return editor as CodeEditorEnum
      }
    }
    return fallback
  }

  async function loadEditorLangGroupsData() {
    const data = await groupsPersistence.load()
    if (data) {
      groups.value = data
    }
    else {
      // If no data is found, save the default groups
      await saveEditorLangGroupsData()
    }
  }

  async function saveEditorLangGroupsData() {
    await groupsPersistence.save(groups.value)
  }

  return {
    getEditorByLanguage,
    loadEditorLangGroupsData,
    saveEditorLangGroupsData,
  }
})
