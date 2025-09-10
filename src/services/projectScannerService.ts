import type { CodeEditorEnum } from '~/constants/codeEditor'
import { languageToEditorMap } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { LanguageAnalyzer } from '~/services/languageAnalyzer'
import { useProjectScannerStore } from '~/stores/projectScannerStore'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

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
export async function getNewProjectRoots(): Promise<Set<string>> {
  const projects = useProjectsStore()
  if (projects.allProjects.length === 0) {
    // 如果当前项目列表为空，则不扫描新增项目，避免误添加过多项目
    return new Set<string>()
  }

  const projectScanner = useProjectScannerStore()
  const settings = useSettingsStore()

  await projectScanner.loadProjectScannerData()

  // 将现有项目路径加入已扫描列表，避免重复扫描
  projects.allProjects.forEach((project) => {
    projectScanner.addScannedPath(project.path)
  })

  const existingPaths = projectScanner.allHistoryScannedPaths
  const newProjectRoots = new Set<string>()

  for (const root of settings.projectScannerRoots) {
    const { folders, error } = await window.api.getFolderList(root)
    if (error) {
      console.error(`Error fetching folders for root ${root}:`, error)
      continue
    }

    folders.forEach((fullPath) => {
      if (!existingPaths.has(fullPath)) {
        newProjectRoots.add(fullPath)
        projectScanner.addScannedPath(fullPath)
      }
    })
  }

  await projectScanner.saveProjectScannerData()

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
      isExists: true,
    }

    await projects.addProject(newProject, false)
  }

  await projects.saveProjects()
}
