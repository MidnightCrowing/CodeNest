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
  let loadingPromise: Promise<void> | null = null

  function getEditorByLanguage(
    lang: string,
    fallback: CodeEditorEnum | null = null,
  ): CodeEditorEnum | null {
    lang = lang.toLowerCase()
    for (const [editor, langs] of Object.entries(groups.value) as Array<[CodeEditorEnum, string[]]>) {
      if (langs.includes(lang)) {
        return editor
      }
    }
    return fallback
  }

  async function loadEditorLangGroupsData() {
    if (loadingPromise)
      return loadingPromise

    const cachedData = groupsPersistence.loadCached()
    if (cachedData)
      groups.value = cachedData

    loadingPromise = loadEditorLangGroupsFromDisk().finally(() => {
      loadingPromise = null
    })
    return loadingPromise
  }

  async function loadEditorLangGroupsFromDisk() {
    const data = await groupsPersistence.load()
    if (data)
      groups.value = data
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
