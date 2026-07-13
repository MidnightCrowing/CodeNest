import { describe, expect, it } from 'vitest'

import {
  canOpenRemoteProject,
  CodeEditorEnum,
  codeEditorOrder,
  editorCommandKeys,
  editorCommandOptions,
  getEditorCommandKey,
  isCliHistoryScannerEditor,
  isCodeEditor,
  isJetBrainsEditor,
  isVscodeHistoryScannerEditor,
  projectHistoryScannerEditors,
} from './codeEditor'

describe('codeEditor constants', () => {
  it('validates known editor enum values', () => {
    expect(isCodeEditor(CodeEditorEnum.VisualStudioCode)).toBe(true)
    expect(isCodeEditor('unknown-editor')).toBe(false)
  })

  it('keeps command keys aligned with command options', () => {
    expect(editorCommandKeys).toEqual(editorCommandOptions.map(option => option.key))
    expect(editorCommandOptions.map(option => option.key)).toEqual(codeEditorOrder)
    expect(getEditorCommandKey(CodeEditorEnum.Cursor)).toBe(CodeEditorEnum.Cursor)
  })

  it('classifies JetBrains editors', () => {
    expect(isJetBrainsEditor(CodeEditorEnum.IntellijIdea)).toBe(true)
    expect(isJetBrainsEditor(CodeEditorEnum.WebStorm)).toBe(true)
    expect(isJetBrainsEditor(CodeEditorEnum.VisualStudioCode)).toBe(false)
  })

  it('limits remote project support to VS Code style history scanners', () => {
    expect(canOpenRemoteProject(CodeEditorEnum.VisualStudioCode)).toBe(true)
    expect(canOpenRemoteProject(CodeEditorEnum.Cursor)).toBe(true)
    expect(canOpenRemoteProject(CodeEditorEnum.IntellijIdea)).toBe(false)
    expect(canOpenRemoteProject(CodeEditorEnum.ClaudeCode)).toBe(false)
  })

  it('builds project history scanner editors from VS Code style and CLI scanners', () => {
    expect(projectHistoryScannerEditors.every(editor =>
      isVscodeHistoryScannerEditor(editor) || isCliHistoryScannerEditor(editor),
    )).toBe(true)
    expect(projectHistoryScannerEditors).toContain(CodeEditorEnum.VisualStudioCode)
    expect(projectHistoryScannerEditors).toContain(CodeEditorEnum.ClaudeCode)
    expect(projectHistoryScannerEditors).not.toContain(CodeEditorEnum.IntellijIdea)
  })
})
