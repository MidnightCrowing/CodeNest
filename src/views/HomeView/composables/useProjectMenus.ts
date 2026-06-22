import type { UiActionMenuItem } from '~/components/ui/actionMenu'
import type { CodeEditorEnum } from '~/constants/codeEditor'
import { editorCommandOptions, isVscodeHistoryScannerEditor } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import {
  DEFAULT_EDITOR_ACTION_PREFIX,
  DEFAULT_EDITOR_AUTO_ACTION,
  OPEN_WITH_ACTION_PREFIX,
} from '../constants'

/**
 * 项目菜单构建
 *
 * 负责构建项目右键菜单和操作菜单，包括：
 * - 编辑器选择菜单（打开方式、默认编辑器）
 * - 项目操作菜单（编辑、置顶、归档、删除等）
 */

interface MenuDependencies {
  t: (key: string, params?: Record<string, unknown>) => string
  editorHasLaunchCommand: (editor: CodeEditorEnum) => boolean
}

export function useProjectMenus(deps: MenuDependencies) {
  const { t, editorHasLaunchCommand } = deps

  function editorMenuIcon(option: (typeof editorCommandOptions)[number]) {
    return option.icon
      ? ['ide-icon', option.icon, option.monochromeIcon ? 'monochrome-editor-icon' : ''].filter(Boolean).join(' ')
      : undefined
  }

  function editorMenuItems(project: LocalProject, mode: 'open-with' | 'default-editor'): UiActionMenuItem[] {
    return editorCommandOptions.map((option, index) => {
      const previousOption = editorCommandOptions[index - 1]
      const isCurrentDefault = mode === 'default-editor' && option.key === project.defaultOpen
      const hasLaunchCommand = editorHasLaunchCommand(option.key)

      return {
        id: `${mode === 'open-with' ? OPEN_WITH_ACTION_PREFIX : DEFAULT_EDITOR_ACTION_PREFIX}${option.key}`,
        label: option.label,
        icon: editorMenuIcon(option),
        checked: isCurrentDefault,
        disabled: (mode === 'open-with' && (!project.isExists || !hasLaunchCommand))
          || (project.isRemote && !isVscodeHistoryScannerEditor(option.key)),
        separatorBefore: index > 0 && option.groupKey !== previousOption.groupKey,
      }
    })
  }

  function defaultEditorMenuItems(project: LocalProject): UiActionMenuItem[] {
    return [
      {
        id: DEFAULT_EDITOR_AUTO_ACTION,
        label: t('app.home.actions.auto_editor'),
      },
      ...editorMenuItems(project, 'default-editor').map((item, index) => ({
        ...item,
        separatorBefore: index === 0 || item.separatorBefore,
      })),
    ]
  }

  function canDeleteProjectFiles(project: LocalProject) {
    // 远程项目没有本地文件,只能从列表移除
    return project.isTemporary && project.isExists !== false && !project.isRemote
  }

  function isSourceProject(project: LocalProject) {
    return project.kind === ProjectKind.FORK || project.kind === ProjectKind.CLONE
  }

  function projectSourceUrl(project: LocalProject) {
    return isSourceProject(project) ? project.fromUrl?.trim() || '' : ''
  }

  function projectMenuItems(project: LocalProject): UiActionMenuItem[] {
    const canDeleteFiles = canDeleteProjectFiles(project)
    const sourceUrl = projectSourceUrl(project)

    return [
      {
        id: 'open',
        label: t('app.home.actions.open_project'),
        disabled: !project.isExists,
        shortcut: ['return'],
      },
      {
        id: 'open-with',
        label: t('app.home.actions.open_with'),
        disabled: !project.isExists,
        submenuWidth: 220,
        children: editorMenuItems(project, 'open-with'),
      },
      {
        id: 'default-editor',
        label: t('app.home.actions.default_editor'),
        submenuWidth: 220,
        children: defaultEditorMenuItems(project),
      },
      {
        id: 'edit',
        label: t('app.home.actions.edit'),
        shortcut: ['mod', 'i'],
      },
      {
        id: 'pin',
        label: project.isPinned ? t('app.home.actions.unpin') : t('app.home.actions.pin'),
        shortcut: ['mod', 'p'],
      },
      {
        id: 'archive',
        label: project.isArchived ? t('app.home.actions.unarchive') : t('app.home.actions.archive'),
        shortcut: ['mod', 'h'],
        separatorBefore: true,
      },
      {
        id: 'explorer',
        label: t('app.home.actions.open_explorer'),
        disabled: !project.isExists,
      },
      {
        id: 'terminal',
        label: t('app.home.actions.open_terminal'),
        disabled: !project.isExists,
      },
      {
        id: 'copy-path',
        label: t('app.home.actions.copy_path'),
      },
      ...(sourceUrl
        ? [{
            id: 'open-source',
            label: t('app.home.actions.open_source'),
          }]
        : []),
      {
        id: 'remove',
        label: canDeleteFiles ? t('app.home.actions.delete') : t('app.home.actions.remove'),
        icon: 'i-lucide:trash-2',
        shortcut: 'delete',
        danger: true,
        separatorBefore: true,
      },
    ]
  }

  return {
    projectMenuItems,
    editorMenuItems,
    defaultEditorMenuItems,
    canDeleteProjectFiles,
    isSourceProject,
    projectSourceUrl,
  }
}
