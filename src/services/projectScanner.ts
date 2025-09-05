import type { CodeEditorEnum } from '~/constants/codeEditor'
import { languageToEditorMap } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { LanguageAnalyzer } from '~/services/languageAnalyzer'
import { useProjectsStore } from '~/stores/projects'
import { useSettingsStore } from '~/stores/settings'

function toRegExp(pattern: string): RegExp | null {
  try {
    // 提取 /.../flags 形式的输入
    const match = pattern.match(/^\/(.*)\/([gimsuy]*)$/)
    if (match) {
      return new RegExp(match[1], match[2])
    }
    // 如果用户没加 /.../，就直接当正文
    return new RegExp(pattern)
  }
  catch (e) {
    console.error('Invalid regex:', e)
    return null
  }
}

/**
 * 获取新增的项目目录列表
 * @returns 新增的项目目录数组
 */
export async function getNewProjectRoots(): Promise<string[]> {
  const projects = useProjectsStore()
  const settings = useSettingsStore()

  const existingPaths = new Set(projects.allProjects.map(project => project.path))
  const newProjectRoots: string[] = []

  for (const root of settings.projectScannerRoots) {
    const { folders, error } = await window.api.getFolderList(root)
    if (error) {
      console.error(`Error fetching folders for root ${root}:`, error)
      continue
    }

    folders.forEach((fullPath) => {
      if (!existingPaths.has(fullPath)) {
        newProjectRoots.push(fullPath)
      }
    })
  }

  return newProjectRoots
}

/**
 * 获取新增的项目目录并添加到项目列表
 */
export async function addNewProjects() {
  const projects = useProjectsStore()
  const settings = useSettingsStore()
  const newProjectRoots = await getNewProjectRoots()

  for (const path of newProjectRoots) {
    const parts = path.split(/[\\/]/)
    const name = parts[parts.length - 1] || 'Unnamed Project'

    const analyzer: LanguageAnalyzer = new LanguageAnalyzer(path)
    const success: boolean = await analyzer.analyze()
    const mainLang: string = success ? analyzer.mainLang || 'unknown' : 'unknown'
    const mainLangColor = success ? analyzer.mainLangColor || undefined : undefined
    const langGroup = success ? analyzer.langGroup || [] : []

    const defaultOpen: CodeEditorEnum = settings.projectScannerOpenMode === 'specified'
      ? settings.projectScannerEditor
      : languageToEditorMap[mainLang.toLowerCase()] || settings.projectScannerEditor

    const isTemporary: boolean = toRegExp(settings.projectScannerNamePattern)?.test(name) || false

    const newProject: LocalProject = {
      appendTime: Date.now(),
      path,
      name,
      group: '',
      kind: ProjectKind.MINE,
      mainLang,
      mainLangColor,
      langGroup,
      defaultOpen,
      isTemporary,
    }

    await projects.addProject(newProject, false)
  }

  await projects.saveProjects()
}
