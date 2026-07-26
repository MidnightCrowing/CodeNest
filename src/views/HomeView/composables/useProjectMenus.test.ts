import { describe, expect, it } from 'vitest'

import type { EditorCommandOption } from '~/constants/codeEditor'
import { CodeEditorEnum } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import {
  DEFAULT_EDITOR_ACTION_PREFIX,
  DEFAULT_EDITOR_AUTO_ACTION,
  OPEN_WITH_ACTION_PREFIX,
} from '~/constants/projectActions'
import {
  PROJECT_OPEN_WITH_MENU_ID,
  useProjectMenus,
} from '~/views/HomeView/composables/useProjectMenus'

function editorOption(editor: CodeEditorEnum, groupKey = 'group', openInTerminal = false): EditorCommandOption {
  return {
    key: editor,
    label: editor,
    groupKey,
    openInTerminal,
    editors: [editor],
  }
}

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

function createMenus(
  options: EditorCommandOption[],
  extra: {
    editorHasLaunchCommand?: (editor: CodeEditorEnum) => boolean
    editorOpensInTerminal?: (editor: CodeEditorEnum) => boolean
  } = {},
) {
  return useProjectMenus({
    t: key => key,
    editorCommandOptions: () => options,
    editorHasLaunchCommand: extra.editorHasLaunchCommand || (() => true),
    editorOpensInTerminal: extra.editorOpensInTerminal || (() => false),
  })
}

describe('useProjectMenus', () => {
  it('builds the shared Open With submenu and disables it for missing projects', () => {
    const menus = createMenus([
      editorOption(CodeEditorEnum.VisualStudioCode),
    ])
    const items = menus.projectMenuItems(project())
    const openWithMenu = items.find(item => item.id === PROJECT_OPEN_WITH_MENU_ID)

    expect(openWithMenu).toMatchObject({
      id: PROJECT_OPEN_WITH_MENU_ID,
      disabled: false,
      submenuWidth: 220,
      children: [{
        id: `${OPEN_WITH_ACTION_PREFIX}${CodeEditorEnum.VisualStudioCode}`,
        disabled: false,
      }],
    })

    const missingProjectItems = menus.projectMenuItems(project({ isExists: false }))
    expect(missingProjectItems.find(item => item.id === PROJECT_OPEN_WITH_MENU_ID)).toMatchObject({
      disabled: true,
      children: [{ disabled: true }],
    })
  })

  it('builds editor menus from visible editor options only', () => {
    const menus = createMenus([
      editorOption(CodeEditorEnum.VisualStudioCode),
      editorOption(CodeEditorEnum.Cursor),
    ])

    expect(menus.editorMenuItems(project(), 'open-with').map(item => item.id)).toEqual([
      `${OPEN_WITH_ACTION_PREFIX}${CodeEditorEnum.VisualStudioCode}`,
      `${OPEN_WITH_ACTION_PREFIX}${CodeEditorEnum.Cursor}`,
    ])
  })

  it('disables remote-incompatible editor choices and auto selection when none are compatible', () => {
    const menus = createMenus([
      editorOption(CodeEditorEnum.IntellijIdea),
    ])
    const remoteProject = project({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/srv/project',
    })

    expect(menus.defaultEditorMenuItems(remoteProject)).toMatchObject([
      { id: DEFAULT_EDITOR_AUTO_ACTION, disabled: true },
      { id: `${DEFAULT_EDITOR_ACTION_PREFIX}${CodeEditorEnum.IntellijIdea}`, disabled: true },
    ])
    expect(menus.editorMenuItems(remoteProject, 'open-with')).toMatchObject([
      { id: `${OPEN_WITH_ACTION_PREFIX}${CodeEditorEnum.IntellijIdea}`, disabled: true },
    ])
  })

  it('allows remote auto selection when a visible editor supports remote projects', () => {
    const menus = createMenus([
      editorOption(CodeEditorEnum.VisualStudioCode),
      editorOption(CodeEditorEnum.IntellijIdea),
    ])
    const remoteProject = project({
      isRemote: true,
      remoteHost: 'devbox',
      remotePath: '/srv/project',
    })

    expect(menus.defaultEditorMenuItems(remoteProject)).toMatchObject([
      { id: DEFAULT_EDITOR_AUTO_ACTION, disabled: false },
      { id: `${DEFAULT_EDITOR_ACTION_PREFIX}${CodeEditorEnum.VisualStudioCode}`, disabled: false },
      { id: `${DEFAULT_EDITOR_ACTION_PREFIX}${CodeEditorEnum.IntellijIdea}`, disabled: true },
    ])
  })

  it('hides terminal command copy when the project default editor is hidden', () => {
    const menus = createMenus(
      [editorOption(CodeEditorEnum.VisualStudioCode)],
      {
        editorHasLaunchCommand: () => true,
        editorOpensInTerminal: () => true,
      },
    )

    const items = menus.projectMenuItems(project({
      defaultOpen: CodeEditorEnum.ClaudeCode,
    }))

    expect(items.map(item => item.id)).not.toContain('copy-terminal-command')
  })

  it('shows terminal command copy when the project default editor is visible and terminal-based', () => {
    const menus = createMenus(
      [editorOption(CodeEditorEnum.ClaudeCode, 'ai-cli', true)],
      {
        editorHasLaunchCommand: editor => editor === CodeEditorEnum.ClaudeCode,
        editorOpensInTerminal: editor => editor === CodeEditorEnum.ClaudeCode,
      },
    )

    const items = menus.projectMenuItems(project({
      defaultOpen: CodeEditorEnum.ClaudeCode,
    }))

    expect(items.map(item => item.id)).toContain('copy-terminal-command')
  })
})
