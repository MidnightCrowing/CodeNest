import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'

import { useEditorLangGroupsStore } from './editorLangGroupsStore'

describe('editorLangGroupsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('matches languages case-insensitively using the default groups', () => {
    const store = useEditorLangGroupsStore()

    expect(store.getEditorByLanguage('TypeScript')).toBe(CodeEditorEnum.WebStorm)
    expect(store.getEditorByLanguage('GO')).toBe(CodeEditorEnum.GoLand)
  })

  it('returns the provided fallback for unknown languages', () => {
    const store = useEditorLangGroupsStore()

    expect(store.getEditorByLanguage('UnknownLanguage', CodeEditorEnum.VisualStudioCode)).toBe(CodeEditorEnum.VisualStudioCode)
    expect(store.getEditorByLanguage('UnknownLanguage')).toBeNull()
  })
})
