import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import {
  analyzing,
  anchorElement,
  hidePop,
  mainLang,
  popupVisible,
  showPop,
} from './LanguagePopProvider'

class FakeHTMLElement {}

function project(overrides: Partial<LocalProject> = {}): LocalProject {
  return {
    appendTime: 1,
    path: 'E:\\Projects\\CodeNest',
    name: 'CodeNest',
    group: '',
    kind: ProjectKind.MINE,
    mainLang: 'TypeScript',
    langGroup: [],
    defaultOpen: CodeEditorEnum.VisualStudioCode,
    isTemporary: false,
    isExists: true,
    ...overrides,
  }
}

describe('languagePopProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('HTMLElement', FakeHTMLElement)
    hidePop()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not show the language popover for remote projects', () => {
    showPop(project({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/srv/project',
    }), new FakeHTMLElement() as HTMLElement)

    expect(popupVisible.value).toBe(false)
    expect(anchorElement.value).toBeNull()
  })

  it('hides the popover and clears transient state', () => {
    popupVisible.value = true
    anchorElement.value = new FakeHTMLElement() as HTMLElement
    analyzing.value = true
    mainLang.value = 'TypeScript'

    hidePop()

    expect(popupVisible.value).toBe(false)
    expect(anchorElement.value).toBeNull()
    expect(analyzing.value).toBe(false)
    expect(mainLang.value).toBe('TypeScript')
  })
})
